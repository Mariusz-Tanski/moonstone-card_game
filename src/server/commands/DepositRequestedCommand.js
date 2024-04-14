import { Command } from '@colyseus/command';
import Logger from '../helpers/Logger';

export default class DepositRequestedCommand extends Command {
  async execute({ client }) {
    const { players } = this.state;

    var player = players.get(client.sessionId);

    player.depositStatus = 'requested'
    players.set(client.sessionId, player)
    Logger.log(`Player ${player.fullId} requested deposit.`)
  }
}
