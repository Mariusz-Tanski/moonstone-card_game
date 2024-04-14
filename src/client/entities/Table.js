import Card from './Card';
import DropZone from './DropZone'

export default class Table {
  constructor(scene) {
    this.scene = scene;
    this.dropZone = new DropZone(scene);
    this.cards = [];
    const dropZoneContainer = this.dropZone.container;

    const cardsSlots = this.scene.maxPlayers;
    for (let i = 0; i < cardsSlots; i++) {
      const card = new Card(this.scene, 0, {});
      var x = dropZoneContainer.width / cardsSlots *
              (i - (cardsSlots / 2)) +
              dropZoneContainer.width / (cardsSlots * 2);

      card.x = x;
      card.y = 0;
      card.hide();
      dropZoneContainer.add(card);
      this.cards.push(card);
    }

    this.initCardDragging();
  }

  show() {
    this.dropZone.show();
  }

  clear() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].clear();
    }
    this.dropZone.enable();
  }

  update(size) {
    for (let i = 0; i < size; i++) {
      this.cards[i].setVisible(true);
    }
  }

  reveal(table) {
    var winnerCard = this.cards[0];
    for (let i = 0; i < table.length; i++) {
      var card = this.cards[i];
      card.updateCard(table[i]);
      card.reveal();
      if (winnerCard.mass < card.mass) winnerCard = card;
    }

    winnerCard.markAsWinner();
  }

  initCardDragging() {
    let scene = this.scene;
    this.scene.input
    .on('drag', function (_, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    })
    .on('dragend', function (_, card) {
      card.x = card.initialX;
      card.y = card.initialY;
    })
    .on('drop', function (_, card, dz) {
      scene.player.hand.selectCard(card);
      scene.player.active = false;
    })
  }
}
