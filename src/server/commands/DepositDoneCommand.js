import { Command, Dispatcher } from '@colyseus/command';

import PrepareGameCommand from './PrepareGameCommand';
import Wallet from '../models/Wallet';
import Logger from '../helpers/Logger';

export default class DepositDoneCommand extends Command {
  async execute({ client }) {
    const { players } = this.state;

    var player = players.get(client.sessionId);

    player.depositStatus = await this.getDepositStatus(player.address);

    if (player.depositDone) {
      await Wallet.findOrCreateBy({ address: player.address })
      .then((wallet) => {
        wallet.addNewRoomData(this.room);
        Logger.log(`Player ${player.fullId} deposited correct bid.`)
      })
    } else {
      Logger.log(`Player ${player.fullId} hasn't deposited correct bid. Kicking...`)
      client.leave();
      return
    }

    players.set(client.sessionId, player)

    this.room.broadcast('player-joined', players.size)

    if (!this.allPlayersReady()) {
      if (this.room.maxClients > this.state.players.size)
        this.room.resetWaitForPlayersCounter();
      return;
    }

    this.clock.setTimeout(
      () => {
        if (this.state.gameState != 'ongoing') {
          new Dispatcher(this.room).dispatch(new PrepareGameCommand());
        }
      },
      1000
    );
  }

  allPlayersReady() {
    var playersReady = [];
    this.state.players.forEach(player => {
      if (player.depositDone) { playersReady.push(player) }
    });

    return playersReady.length == this.room.maxClients;
  }

  async getDepositStatus(address) {
    var ok = await this.room.contract.verifyDeposit(address, this.room);
    return ok ? 'done' : 'rejected'
  }
}
