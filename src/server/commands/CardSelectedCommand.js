import { Command, Dispatcher } from '@colyseus/command';

import Logger from '../helpers/Logger';
import StartPlayerTurnCommand from './StartPlayerTurnCommand';
import SummarizeRoundCommand from './SummarizeRoundCommand';

export default class CardSelectedCommand extends Command {
  execute(data) {
    this.state.waitingForCardPick = false;

    if (data) {
      this.playerPick(data);
    } else {
      this.autoPick();
    }

    if (!this.selectedCard) return;
    if (!this.currentPlayer.active) return;

    Logger.log(`Player ${this.currentPlayer.fullId} picked ${JSON.stringify(this.selectedCard)} card.`)
    this.room.broadcast('card-selected', {
      id: this.currentPlayer.humanId,
      cardIndex: this.selectedCard.index
    });

    this.currentPlayer.hand = this.currentPlayer.hand.filter((c => {
      return c != this.selectedCard
    }));

    this.currentPlayer.active = false;
    this.state.players.set(this.sessionId, this.currentPlayer);

    this.state.table.push({
      ...this.selectedCard,
      owner: this.sessionId,
      id: this.currentPlayer.humanId
    });

    this.room.broadcast('table-updated', this.state.table.length);
    if (!data) { this.notifyClientAboutAutoPick(); }

    var dispatcher = new Dispatcher(this.room);
    if (this.state.playersOrder.length > 0) {
      dispatcher.dispatch(new StartPlayerTurnCommand());
    } else {
      this.clock.setTimeout(
        () => { dispatcher.dispatch(new SummarizeRoundCommand()); },
        1000
      );
    }
  }

  playerPick(data) {
    const { client, card } = data;

    this.sessionId = client.sessionId;
    this.currentPlayer = this.state.players.get(client.sessionId);
    if (!this.currentPlayer) return;

    this.selectedCard = this.currentPlayer.hand.find((c => {
      return c.name == card.name
    }));
  }

  autoPick() {
    this.state.players.forEach(player => {
      if (player.active) {
        this.sessionId = player.sessionId;
        return this.currentPlayer = player;
      }
    })
    if (!this.currentPlayer) return;

    var i = Math.floor(Math.random() * this.currentPlayer.hand.length)
    this.selectedCard = this.currentPlayer.hand[i];
  }

  notifyClientAboutAutoPick() {
    this.room.clients.forEach((client) => {
      if (this.sessionId == client.sessionId) {
        client.send('card-autopicked', this.selectedCard.index);
        return;
      }
    });
  }
}
