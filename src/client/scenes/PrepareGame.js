import Button from '../helpers/Button';
import InfoText from '../helpers/InfoText';

import AnimatedImages from './AnimatedImages';
import BugReportLink from './BugReportLink';

export default class PrepareGame extends Phaser.Scene {
  constructor() {
    super({ key: 'prepareGame' });
	}

  preload() {
    const { serverHost, serverPort } = this.game.config;
    var port = serverPort ? ':' + serverPort : '';
    this.baseUrl = 'http://' + serverHost + port
  }

  create() {
    new AnimatedImages(this);
    new BugReportLink(this);

    this.infoText = new InfoText(this);
    this.infoText.showLoading()
    this.tokensMultiplier = Math.pow(10, 9)

    this.checkServerStatus()
  }

  checkServerStatus() {
    fetch(this.baseUrl + '/status')
    .then(response => response.json())
    .then(data => {
      if (data.status == 'ok') {
        this.bids = data.bids
        this.initContract()
      } else {
        this.infoText.show(data.message)
      }
    })
    .catch(_ => { this.infoText.show('Game server is currently unavaliable') })
  }

  getWalletData() {
    this.infoText.showLoading()

    var url = this.baseUrl + '/wallet/' + this.address
    fetch(url)
    .then(response => response.json())
    .then(data => { this.checkStatus(data.status) })
  }

  checkStatus(status) {
    var gameAllowedStatuses = ['ok', 'not_found']

    if (gameAllowedStatuses.includes(status)) {
      this.checkAllowance();
    } else if (status == 'game_in_progress') {
      this.infoText.show('Game already in progress...');
    }
  }

  getClaims() {
    this.game.config.contract.methods.hasDeposit(this.address).call()
    .then(response => {
      var downcaseAddress = this.address.toLowerCase()
      var claimableDepos = response.deposits
      .filter(depo => {
        return depo.user.toLowerCase() == downcaseAddress && depo.claimable == 1
      })

      if (claimableDepos.length == 0) return

      const claimable = claimableDepos
      .map(depo => { return parseInt(depo.amount) })
      .reduce((sum, amount) => { return sum + amount })

      this.showClaimButton(claimable)
    })
  }

  showClaimButton(claimable) {
    if (claimable == 0) return

    const claimableHuman = Math.floor(Math.pow(0.1, 9) * claimable)
    this.claimButton.setText(`Claim - ${this.formatAmount(claimableHuman)} MSG`)
    this.claimButton.show()
  }

  checkAllowance() {
    this.game.config.token.methods.totalSupply()
    .call()
    .then(totalSupply => {
      this.totalSupply = totalSupply
      this.game.config.token.methods.allowance(
        this.address,
        this.game.config.contractAddress
      )
      .call()
      .then(allowedAmount => {
        if (allowedAmount >= BigInt(this.bids.big * this.tokensMultiplier)) {
          this.showGameModeButtons()
          this.approveButton.hide()
        } else {
          this.hideGameModeButtons()
          this.infoText.show('You need to approve MSG token (one time action)')
          this.approveButton.show()
        }
      })
    })
  }

  onWalletConnected(address) {
    var shortAddress = address.substr(0, 4) + '...' + address.substr(address.length - 4);
    this.connectWalletButton.setText(shortAddress);
    this.address = address;
    this.getWalletData()
    this.getClaims()
  }

  async initContract() {
    const Web3 = require('web3');
    this.web3 = new Web3(Web3.givenProvider);
    var url = this.baseUrl + '/abi'
    fetch(url)
    .then(response => response.json())
    .then(json => {
      const { contract, token } = json

      if (contract && contract != '') {
        this.game.config.contract =
          new this.web3.eth.Contract(contract, this.game.config.contractAddress)
      } else {
        console.log("No contract ABI available.");
      }

      if (token && token != '') {
        this.game.config.token =
          new this.web3.eth.Contract(token, this.game.config.tokenAddress)
      } else {
        console.log("No token ABI available.");
      }

      if (this.game.config.contract && this.game.config.token) {
        this.initConfigButtons();
        this.initWallet();
      } else {
        this.infoText.show('Failed to fetch contract info')
      }
    })
    .catch(_ => { this.infoText.show('Failed to fetch contract info') })
  }

  approveToken() {
    this.approveButton.hide()
    this.game.config.token.methods.approve(
      this.game.config.contractAddress,
      this.totalSupply
    )
    .send({ from: this.address })
    .then(() => this.showGameModeButtons())
    .catch(() => this.approveButton.show())
  }

  initWallet() {
    this.connectWalletButton =
      new Button(this, this.cameras.main.width - 150, 50, { text: 'Connect Wallet' });

    try {
      ethereum;
    } catch {
      this.infoText.show('MetaMask extension not found');
      return;
    }

    ethereum.on('chainChanged', () => { this.scene.restart(); });

    if (ethereum.networkVersion != this.game.config.networkVersion) {
      this.infoText.show('Please select Binance Smart Chain network');
      return;
    }

    ethereum.on('accountsChanged', () => { this.connectWallet(); });

    this.connectWalletButton.on('pointerup', () => {
      //Will Start the metamask extension
      ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((result) => { this.onWalletConnected(result[0]); })
    }, this);

    this.connectWallet();
  }

  connectWallet() {
    if (ethereum.isConnected() && ethereum.selectedAddress) {
      this.onWalletConnected(ethereum.selectedAddress);
    } else {
      this.infoText.show('Please connect your wallet');
      this.connectWalletButton.setText('Connect wallet');
      this.hideBidOptions();
    }
  }

  initConfigButtons() {
    const { width, height } = this.cameras.main;

    this.twoPlayersButton =
      new Button(this, width * 0.33, height * 0.6, { text: '1 v 1'}).setVisible(false).
        on('pointerup', () => {
          this.duel = true;
          this.showBidOptions();
        })

    this.fourPlayersButton =
      new Button(this, width * 0.66, height * 0.6, { text: '4 players'}).setVisible(false).
        on('pointerup', () => {
          this.duel = false;
          this.showBidOptions();
        })

    this.smallBidButton =
      new Button(this, width * 0.25, height * 0.6, { text: `${this.formatAmount(this.bids.small)} MSG`})
        .setVisible(false)
        .on('pointerup', () => {
          this.scene.start('play', {
            address: this.address,
            room: 'small_bid_room',
            bid: BigInt(this.bids.small * this.tokensMultiplier).toString(),
            duel: this.duel
          });
        })

    this.mediumBidButton =
      new Button(this, width * 0.5, height * 0.6, { text: `${this.formatAmount(this.bids.medium)} MSG`})
        .setVisible(false)
        .on('pointerup', () => {
          this.scene.start('play', {
            address: this.address,
            room: 'medium_bid_room',
            bid: BigInt(this.bids.medium * this.tokensMultiplier).toString(),
            duel: this.duel
          });
        })

    this.bigBidButton =
      new Button(this, width * 0.75, height * 0.6, { text: `${this.formatAmount(this.bids.big)} MSG`})
        .setVisible(false)
        .on('pointerup', () => {
          this.scene.start('play', {
            address: this.address,
            room: 'big_bid_room',
            bid: BigInt(this.bids.big * this.tokensMultiplier).toString(),
            duel: this.duel
          });
        })

    this.approveButton =
      new Button(this, width * 0.5, height * 0.6, { text: 'Approve MSG'}).setVisible(false).
        on('pointerup', () => { this.approveToken() })

    this.claimButton =
      new Button(this, width * 0.5, height * 0.9, { text: 'Claim prizes', width: 400 }).setVisible(false).
        on('pointerup', () => { this.claimRewards() })
  }

  showGameModeButtons() {
    this.hideBidOptions();
    this.infoText.show('Select game mode');

    this.twoPlayersButton.show()
    this.fourPlayersButton.show()
  }

  hideGameModeButtons() {
    this.twoPlayersButton.hide()
    this.fourPlayersButton.hide()
  }

  showBidOptions() {
    this.hideGameModeButtons();
    this.infoText.show('Select your bid');

    this.smallBidButton.show()
    this.mediumBidButton.show()
    this.bigBidButton.show()
  }

  hideBidOptions() {
    this.smallBidButton.hide()
    this.mediumBidButton.hide()
    this.bigBidButton.hide()
  }

  claimRewards() {
    this.game.config.contract.methods
    .withdrawVesting()
    .estimateGas({ from: this.address })
    .then(gas => {
      this.game.config.contract.methods
      .withdrawVesting()
      .send({ from: this.address, gas: gas })
      .on('receipt', () => this.claimButton.hide())
      .on('error', (error) => { console.log(error) })
    })
  }

  formatAmount(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }
}
