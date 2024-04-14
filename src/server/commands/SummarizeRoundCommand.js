import { Command, Dispatcher } from '@colyseus/command';

import StartRoundCommand from './StartRoundCommand';
import Wallet from '../models/Wallet';
import Logger from '../helpers/Logger';

export default class SummarizeRoundcommand extends Command {
  execute() {
    this.state.roundsRemaining--;

    const roundWinner = this.findWiner();

    if (roundWinner) {
      Logger.log(`Player ${roundWinner.fullId} has won. His current score is: ${roundWinner.score}`)
      this.room.broadcast('player-won-round', roundWinner.humanId);
    } else {
      Logger.log(`Round ended with a draw...`)
    }

    if (this.state.roundsRemaining > 0) {
      this.clock.setTimeout(
        () => { new Dispatcher(this.room).dispatch(new StartRoundCommand()); },
        3000
      );
    } else {
      this.state.gameState = 'finished';
      this.findGameWinners()

      this.removeBots();

      this.room.contract.setWinner(this.state.players, this.room);

      this.markRoomsAsFinishedForAutoPlayedWallets();

      Logger.log('--- Game over ---')
      this.room.disconnect();
    }
  }

  markRoomsAsFinishedForAutoPlayedWallets() {
    this.state.players.forEach(player => {
      if (player.autoplay) this.markRoomAsFinished(player);
    });
  }

  async markRoomAsFinished(player) {
    const wallet = await Wallet.find({ address: player.address });
    await wallet.markRoomAsFinished(this.room.roomId, player);
  }

  broadcastTable(table) {
    var publicTable = table.map((card) => {
      const { mass, name, index } = card;
      return { mass, name, index };
    })
    this.room.broadcast('table-revealed', publicTable);

    Logger.log(`Round ${this.room.handSize - this.state.roundsRemaining} ended with table: ${JSON.stringify(publicTable)}.`)

    return table;
  }

  findWiner() {
    const table = Array.from(this.state.table);
    let stoneCard;
    let moonOnTable = false;
    let stoneOnTable = false;
    let draw = false;

    var winnerCard = null
    for (let i = 0; i < table.length; i++) {
      var card = table[i];

      if (card.name == 'stone') {
        stoneCard = card;
        stoneOnTable = true;
      } else if (card.name == 'moon') {
        moonOnTable = true;7
      }

      if (stoneOnTable && moonOnTable) {
        Logger.log('BOOSTING STONE! UNLIMITED POWER!')
        stoneCard.mass = 100000;
      }

      if (winnerCard && (winnerCard.mass < card.mass)) {
        winnerCard = card
        draw = false
      } else if (winnerCard && (winnerCard.mass == card.mass)) {
        draw = true
      } else if (!winnerCard) {
        winnerCard = card
      }
    }

    this.broadcastTable(table);

    if (draw) return null

    const player = this.state.players.get(winnerCard.owner);
    player.score += 1;
    this.state.players.set(winnerCard.owner, player);

    return player;
  }

  findGameWinners() {
    const players = Array.from(this.state.players).map(pl => { return pl[1] });
    const scores = players.map((player) => { return player.score })
    const highScore = Math.max.apply(Math, scores)
    const playersWithHighScore = players.filter(player => {
      return player.score == highScore
    })
    const wonAmount = this.room.bid * this.room.maxClients / playersWithHighScore.length

    playersWithHighScore.forEach(player => {
      player.winner = true
      player.wonAmount = wonAmount
      this.state.players.set(player.sessionId, player);
    })

    if (playersWithHighScore.length == 1) {
      const winner = playersWithHighScore[0]
      Logger.log(`Player ${winner.fullId} has won the game.`)
      this.room.broadcast('player-won-game', winner.humanId);
    } else {
      Logger.log(`Game ended with draw...`)
      this.room.broadcast('player-won-game', null);
    }

    const winnerIds = playersWithHighScore.map(p => { return p.humanId })
  }

  removeBots() {
    this.state.players.forEach(player => {
      if (player.bot) this.state.players.delete(player.sessionId);
    });
  }
}
