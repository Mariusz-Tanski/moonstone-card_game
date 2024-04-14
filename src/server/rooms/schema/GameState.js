import { Schema, defineTypes, MapSchema, ArraySchema } from '@colyseus/schema';

export default class GameState extends Schema {
  constructor(handSize) {
    super();

    // public state
    //['pending', 'ongoing', 'finished']
    this.gameState = 'pending';

    // private state
    this.players = new MapSchema();
    this.table = new ArraySchema();
    this.playersOrder = new ArraySchema();
    this.roundsRemaining = handSize;
    this.waitingForCardPick = false;
    this.waitingForPlayers = false;
  }
}

defineTypes(GameState, { gameState: 'string' });
