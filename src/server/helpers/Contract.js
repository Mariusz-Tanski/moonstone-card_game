require('dotenv').config();

import contractABI from './contract_abi';
import Logger from './Logger';

export default class Contract {
  constructor() {
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS
    this.walletAddress = process.env.WALLET_ADDRESS
    this.walletPrivateKey = process.env.WALLET_PRIVATE_KEY
    this.nodeUrl = process.env.NODE_URL

    this.initContract();
  }

  async initContract() {
    const Web3 = require('web3');
    this.web3 = new Web3(this.nodeUrl)
    this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
  }

  async verifyDeposit(address, room) {
    var depoArray = await this.contract.methods.hasDeposit(address).call();
    var downcaseAddress = address.toLowerCase()

    var validDepos = depoArray.deposits.filter(depo => {
      return depo.user.toLowerCase() == downcaseAddress &&
             depo.roomId == room.roomId &&
             depo.amount == room.bid
    })

    return validDepos.length == 1
  }

  async setWinner(players, room) {
    const playersArray = Array.from(players).map(pl => { return pl[1] });

    const allAddresses = playersArray.map((player) => { return player.address })
    const winners = playersArray.filter((player) => { return player.winner })
    let winnerAddresses = winners.map((player) => { return player.address })

    // let winnerAmount = 0
    // if (winners.length == 0) {
    //   winnerAddresses = [this.contractAddress]
    // } else {
    //   winnerAmount = winners[0].wonAmount
    // }

    // to remove for final version
    if (winners.length == 0) return
    const winnerAmount = winners[0].wonAmount
    // ---------------------------

    const tx = this.contract.methods.setWinner(allAddresses, winnerAddresses, room.roomId, winnerAmount)
    const options = {
      to: this.contractAddress,
      data: tx.encodeABI(),
      gas: await tx.estimateGas({from: this.walletAddress})
    }

    const signed  = await this.web3.eth.accounts.signTransaction(options, this.walletPrivateKey)
    this.web3.eth.sendSignedTransaction(signed.rawTransaction)
    .on('receipt', () => {
      Logger.log(`"${winnerAddresses.join(', ')}" set as winner with ${winnerAmount}MSG`)
    })
    .on('error', (error) => {
      Logger.log(`Error while setting winner "${error.message}"`)
    })
  }
}
