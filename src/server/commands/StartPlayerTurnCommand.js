import { Command, Dispatcher } from '@colyseus/command';
import Logger from '../helpers/Logger';

import CardSelectedCommand from './CardSelectedCommand';

export default class StartPlayerTurnCommand extends Command {
  execute() {
    const { playersOrder, players } = this.state;

    if (playersOrder.length == 0) return;

    var currentIndex = playersOrder.pop();
    var currentPlayer = players.get(currentIndex);
    currentPlayer.active = true;

    this.state.players.set(currentIndex, currentPlayer)
    Logger.log(`Player ${currentPlayer.fullId} starting turn...`)

    this.room.broadcast('player-activated', currentPlayer.humanId)

    if (currentPlayer.autoplay) {
      var delay = Math.random() * 2000 + 500;
      this.clock.setTimeout(
        () => { new Dispatcher(this.room).dispatch(new CardSelectedCommand()) },
        Math.floor(delay)
      );
    } else {
      this.room.resetWaitForCardPickCounter();
    }
  }
}
