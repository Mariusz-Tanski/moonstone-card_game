import { Command, Dispatcher } from '@colyseus/command';
import Logger from '../helpers/Logger';

import StartPlayerTurnCommand from './StartPlayerTurnCommand';

export default class StartRoundCommand extends Command {
  execute() {
    const { table } = this.state;

    while (table.length) table.pop(); // clear table

    this.setPlayersOrder();

    Logger.log(`Starting round ${this.room.handSize - this.state.roundsRemaining + 1}...`)
    this.room.broadcast('round-begin')
    this.clock.setTimeout(
      () => { new Dispatcher(this.room).dispatch(new StartPlayerTurnCommand()); },
      1000
    );
  }

  setPlayersOrder() {
    let players = Array.from(this.state.players);
    for (let i = this.room.maxClients; i > 0; i--) {
      var randomIndex = Math.floor(Math.random() * i);
      var player = players.splice(randomIndex, 1)[0];
      this.state.playersOrder.push(player[0]);
    }
  }
}
