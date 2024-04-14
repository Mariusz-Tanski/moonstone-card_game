import { Schema } from '@colyseus/schema';

import deck from '../../helpers/deck';

export default class Deck extends Schema {
  constructor() {
    super();
    this.shuffledDeck = [...deck];

    this.shuffle();
  }

  pop() {
    return this.shuffledDeck.pop();
  }

  shuffle() {
    var currentIndex = deck.length;

    while (currentIndex) {
      var randomIndex = Math.floor(Math.random() * currentIndex--);
      var card = this.shuffledDeck[currentIndex];
      var randomCard = this.shuffledDeck[randomIndex];
      this.shuffledDeck[currentIndex] = randomCard;
      this.shuffledDeck[randomIndex] = card;
    }
  }
}

