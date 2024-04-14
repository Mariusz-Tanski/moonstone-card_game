import { Command, Dispatcher } from '@colyseus/command';
import Logger from '../helpers/Logger';

import Deck from '../rooms/schema/Deck';
import StartRoundCommand from './StartRoundCommand';

export default class PrepareGameCommand extends Command {
  execute() {
    Logger.log('Preparing game...')
    this.state.gameState = 'ongoing';

    this.dealCards();

    this.sendHandsToPlayers()
    .then(() => {
      this.clock.setTimeout(
        () => { new Dispatcher(this.room).dispatch(new StartRoundCommand()); },
        1000
      );
    });
  }

  dealCards() {
    const deck = new Deck();
    const { players } = this.state;

    for (let i = 0; i < this.room.handSize; i++) {
      players.forEach((player) => {
        var card = deck.pop();
        card.index = i;
        player.hand.push(card);
      });
    }

    players.forEach(player => {
      Logger.log(`Player ${player.fullId} received ${JSON.stringify(player.hand)}`);
    });
  }

  async sendHandsToPlayers() {
    this.room.clients.forEach((client) => {
      var player = this.state.players.get(client.sessionId);
      var oponents = Array.from(this.state.players).filter((pl) => {
        return pl[0] != client.sessionId;
      });

      client.send('hand-dealed', {
        player: { hand: player.hand, id: player.humanId },
        oponents: oponents.map((op) => {
          return { hand: op[1].hand, id: op[1].humanId };
        })
      })
    });
  }
}
