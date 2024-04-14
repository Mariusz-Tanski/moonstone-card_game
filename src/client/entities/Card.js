export default class Card extends Phaser.GameObjects.Container {
  constructor(scene, positionX, data) {
    super(scene, positionX, 0);
    this.initialX = positionX;
    this.initialY = 0;

    this.setSize(150,180)

    this.scene = scene;
    this.mass = data.mass;
    this.name = data.name;

    this.cardBg = this.scene.add.rectangle(0, 0, this.width, this.height).
      setStrokeStyle(1, 0x45efff).
      setFillStyle(0x424242, 0.82);
    this.cardBack = this.scene.add.image(0, 0, 'cardBack').setScale(1.2, 1.2);

    this.add(this.cardBg);
    this.add(this.cardBack);

    this.createCardImg()
  }

  updateCard(data) {
    if (!data) return;

    this.cardImg.setTexture(data.name);
    this.cardText.setText(`${data.name}\n${data.mass}`);
    this.mass = data.mass;
    this.name = data.name;
  }

  createCardImg() {
    this.cardImg = this.scene.add.image(0, -25);
    this.cardText = this.scene.add.text(0, 50).
      setOrigin(0.5, 0.5).
      setStyle({
        stroke: '#000',
        strokeThickness: 1,
        align: 'center',
        fontFamily: '"8Bit"',
        fontSize: 12
      });
    this.add(this.cardImg);
    this.add(this.cardText);
    this.cardText.setVisible(false);
    this.cardImg.setVisible(false);
  }

  reveal() {
    this.cardBack.setVisible(false);
    this.cardText.setVisible(true);
    this.cardImg.setVisible(true);
    this.setVisible(true);
  }

  conceal() {
    this.cardText.setVisible(false);
    this.cardImg.setVisible(false);
    this.cardBack.setVisible(true);
  }

  enableDrag() {
    this.setInteractive({ useHandCursor: true, draggable: true});
    this.scene.input.setDraggable(this);
  }

  disableDrag() {
    this.scene.input.setDraggable(this, false);
  }

  hide() {
    this.setVisible(false);
  }

  markAsWinner() {
    this.cardBg.setStrokeStyle(2, 0x3bed00)
  }

  clear() {
    this.update({});
    this.conceal();
    this.hide();
    this.cardBg.setStrokeStyle(1, 0x45efff)
  }
}
