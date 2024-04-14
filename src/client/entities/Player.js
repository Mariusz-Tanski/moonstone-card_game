import Hand from "./Hand";

export default class Player {
  constructor(scene, isLocalPlayer) {
    this.scene = scene;
    this.hand = {};
    this.active = false;
    this.score = 0;
    this.id = null;
    this.isLocalPlayer = isLocalPlayer;
  }

  update(data) {
    this.active = data.active;
    this.score = data.score;
    this.id = data.id;
  }

  initHand(width, height, rotation) {
    this.hand = new Hand(this.scene, width, height, rotation);
    this.hand.isLocalHand = this.isLocalPlayer;
  }

  initScoreText(width, height) {
    this.scoreText = this.scene.add.
      text(width, height, 'Rounds won: 0', this.fontStyle()).
      setOrigin(0.5, 0);
  }

  initNameText(width, height) {
    this.nameText = this.scene.add.
    text(width, height, this.id, this.fontStyle()).
    setOrigin(0.5, 0);
  }

  updateScore() {
    this.score += 1;
    this.scoreText.setText(`Round won: ${this.score}`);
  }

  fontStyle() {
    return {
      stroke: '#000',
      strokeThickness: 1,
      align: 'center',
      fontFamily: '"8Bit"',
      fontSize: 12
    }
  }
}
