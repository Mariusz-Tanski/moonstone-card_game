import { Command } from '@colyseus/command';
import Logger from '../helpers/Logger';
import Wallet from '../models/Wallet';

export default class PlayerLeaveCommand extends Command {
  async execute(data) {
    var player = this.state.players.get(data.sessionId);

    if (this.state.gameState != 'finished' && player.depositStatus == 'done') {
      player.autoplay = true;
      this.state.players.set(player.sessionId, player);
      Logger.log(`Player ${player.fullId} taken over by bot.`)
      return;
    }

    const wallet = await Wallet.find({ address: player.address });
    if (wallet) await wallet.markRoomAsFinished(this.room.roomId, player);

    this.state.players.delete(player.sessionId);

    if (this.state.players.size == 0) {
      Logger.log(`No more players. Room disposing...`)
      this.room.disconnect();
    } else {
      Logger.log(`Waiting for more players...`)
      this.room.unlock();
      this.room.resetWaitForPlayersCounter();
    }
  }
}
