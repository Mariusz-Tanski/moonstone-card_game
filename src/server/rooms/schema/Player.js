import { Schema } from '@colyseus/schema';

export default class Player extends Schema {
  constructor() {
    super();

    this.hand = [];
    this.score = 0;
    this.active = false;
    this.sessionId;
    this.client;
    this.address;
    this.humanId;
    this.autoplay = false;
    this.depositStatus = 'not_requested'; // ['not_requested', 'requested', 'done', 'rejected']
    this.bot = false;
    this.winner = false;
    this.wonAmount = 0;
  }

  get depositDone() {
    return this.depositStatus == 'done';
  }

  get depositNotRequested() {
    return this.depositStatus == 'not_requested';
  }

  get depositRequested() {
    return this.depositStatus == 'requested';
  }

  get depositRejected() {
    return this.depositStatus == 'rejected';
  }

  get fullId() {
    return `${this.sessionId} (${this.humanId})`;
  }
}

