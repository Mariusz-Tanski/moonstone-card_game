import Button from '../helpers/Button';
import InfoText from '../helpers/InfoText';
import AnimatedImages from './AnimatedImages';
import BugReportLink from './BugReportLink';

export default class EndGame extends Phaser.Scene {
	constructor() {
		super({ key: 'endGame' });
	}

  create(data) {
    new AnimatedImages(this);
    new BugReportLink(this);

    const { width, height } = this.cameras.main;

    this.playAgainButton =
      new Button(this, width * 0.5, height * 0.6 , { text: 'Play again!' });
    this.infoText = new InfoText(this)
    this.playAgainButton.on('pointerup', () => {
      this.scene.start('prepareGame')
    });

    if (data.winnerId) {
      this.infoText.show(`Player ${data.winnerId} won!`);
    } else {
      this.infoText.show('Game ended with draw...');
    }
  }
}
