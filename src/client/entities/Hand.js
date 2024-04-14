import Card from './Card';

export default class Hand {
  constructor(scene, x, y, rotation) {
    this.scene = scene
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.cards = [];
    this.roundsWon = 0;
    this.initializeContainer();
    this.active = false;
    this.isLocalHand = false;
    this.revealed = false;

    this.initCards();
  }

  initializeContainer() {
    this.width = 900;
    this.handContainer = this.scene.add.container(this.x, this.y);

    this.handContainer.setSize(this.width, 200);
    this.handContainer.setRotation((this.rotation) * Math.PI / 180);

    this.handBorder = this.scene.add.rectangle(0, 0, this.width, 200).
      setStrokeStyle(5, 0xb8b8b8)
    this.handContainer.add(this.handBorder);
  }

  initCards() {
    for (let i = 0; i < this.scene.handSize; i++) {
      var position = this.handContainer.width / this.scene.handSize *
                     (this.cards.length - (this.scene.handSize - 1) / 2);
      let card = new Card(this.scene, position, {});
      this.cards.push(card);
      this.handContainer.add(card)
    }
  }

  update(cards) {
    cards.forEach((cardData, i) => { this.cards[i].updateCard(cardData) });
  }

  show() {
    if (this.revealed) return;

    this.cards.forEach((card) => { card.reveal(); });
    this.revealed = true;
  }

  activate() {
    if (this.active) return;

    this.handBorder.setStrokeStyle(5, 0x3bed00);
    this.active = true;

    if (!this.isLocalHand) return;

    this.cards.forEach((card) => { card.enableDrag(); });
  }

  deactivate() {
    if (!this.active) return;

    this.handBorder.setStrokeStyle(5, 0xb8b8b8);
    this.active = false;

    if (!this.isLocalHand) return;

    this.cards.forEach((card) => { card.disableDrag(); });
  }

  selectCard(card) {
    card.hide();
    this.scene.server.cardSelected(card);
    this.deactivate();
  }

  autoPick(cardIndex) {
    var card = this.cards[cardIndex];
    card.hide();
    this.deactivate();
  }
}
