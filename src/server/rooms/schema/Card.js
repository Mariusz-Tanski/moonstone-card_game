import { Schema } from '@colyseus/schema';

export default class Card extends Schema {
  constructor(data) {
    super();

    this.name = data.name;
    this.mass = data.mass;
    this.owner = '';
    this.humanId = '';
  }
}
