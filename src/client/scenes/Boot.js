import deck from '../assets/deck';
import starsBg from '../assets/stars.png';
import cardBack from '../assets/planets/back.png';
import astronaut1 from '../assets/astronaut1.png';
import astronaut2 from '../assets/astronaut2.png';
import Intro from '../helpers/Intro';
import Button from '../helpers/Button';

const intro = require('../assets/videos/intro.mp4')

export default class Boot extends Phaser.Scene {
	constructor() {
		super({ key: 'boot' });
	}

  preload() {
    deck.forEach(card => {
      var img = require(`../assets/planets/${card.name}.png`);
      this.load.image(card.name, img);
    });
    this.load.image('cardBack', cardBack);
    this.load.image('starsBg', starsBg);
    this.load.image('astronaut1', astronaut1);
    this.load.image('astronaut2', astronaut2);
    this.load.video('intro', intro);

    var bg = this.add.rectangle(400, 300, 400, 30, 0x666666);
    var bar = this.add.rectangle(bg.x, bg.y, bg.width, bg.height, 0xffffff).setScale(0, 1);
    this.load.on('progress', (progress) => { bar.setScale(progress, 1); });
  }

  create() {
    new Intro(this)
  }
}
