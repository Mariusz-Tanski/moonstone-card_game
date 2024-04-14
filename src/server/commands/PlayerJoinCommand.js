import { Command, Dispatcher } from '@colyseus/command';
import hri from 'human-readable-ids';

import PrepareGameCommand from './PrepareGameCommand';
import Logger from '../helpers/Logger';
import Player from '../rooms/schema/Player';

export default class PlayerJoinCommand extends Command {
  async execute(data) {
    this.state.waitingForPlayers = false;

    const { client, address, bots } = data;

    if (bots) return this.fillEmptyPlayerSpotsWithBots();

    const { players } = this.state;
    var player = this.assignNewPlayer(client, address);

    players.set(client.sessionId, player);
    Logger.log(`Player ${player.fullId} joined waiting room.`)

    this.clock.setTimeout(
      () => {
        if (player.depositNotRequested) {
          Logger.log(`Player ${player.fullId} hasn't requested deposit. Kicking...`)
          client.leave();
        }
      },
      this.room.timeToRequestDeposit
    );
  }

  generateHumanId() {
    var id = hri.hri.random();
    var existingIds = [];

    this.state.players.forEach((player) => {
      if (player.humanId) existingIds.push(player.humanId);
    })

    if (existingIds.includes(id)) {
      this.generateHumanId();
    } else {
      return id;
    }
  }

  assignNewPlayer(client, address) {
    return new Player().assign({
      sessionId: client.sessionId,
      client,
      address,
      humanId: this.generateHumanId()
    });
  }

  fillEmptyPlayerSpotsWithBots() {
    let playersRemaining = this.room.maxClients - this.state.players.size;
    let botIds = [];

    for (var i = 0; i < playersRemaining; i++) {
      var dummyClient = {
        sessionId: new Date().getTime() * i + 1,
        bot: true
      };

      var bot = this.assignNewPlayer(dummyClient);
      bot.bot = true;
      bot.autoplay = true;
      botIds.push(bot.humanId);
      this.state.players.set(dummyClient.sessionId, bot);
    }

    Logger.log(`Filled ${playersRemaining} slots with bots (${botIds.join(', ')}).`)

    this.room.broadcast('player-joined', this.state.players.size)
    this.clock.setTimeout(
      () => {
        if (this.state.gameState != 'ongoing') {
          new Dispatcher(this.room).dispatch(new PrepareGameCommand());
        }
      },
      1000
    );
  }
}
