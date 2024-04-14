export default class InfoText extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);

    const { width, height } = scene.cameras.main;

    this.setDepth(100);
    var textBg = scene.add.rectangle(
      width / 2, height / 2, width * 0.75, 75, 0xb8b8b8, 0.5
    ).setOrigin(0.5, 0.5)

    this.text = scene.add.text(width / 2, height / 2, ['']).
      setFontSize(20).
      setColor('#e3e3e3').
      setOrigin(0.5, 0.5).
      setFontFamily('"8Bit"')

    this.counter = scene.add.text(width * 0.75, height / 2, ['']).
      setFontSize(20).
      setColor('#e3e3e3').
      setOrigin(0.5, 0.5).
      setFontFamily('"8Bit"')

    this.add(textBg).add(this.text).add(this.counter)
    scene.add.existing(this);

    this.stone = scene.add.image(width / 2, height / 2, 'stone').
      setScale(0.75, 0.75)
    this.add(this.stone)
    this.stone.setVisible(false)

    this.hide();

    this.scene.events.on('update', () => { this.stone.angle += 1 })
  }

  setText(text) {
    this.text.setText(text)
  }

  show(text = null) {
    this.hideLoading();
    if (text) this.setText(text);
    this.setCounter('');
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }

  showLoading() {
    this.show(' ')
    this.stone.setVisible(true)
  }

  hideLoading() {
    this.stone.setVisible(false)
  }

  setCounter(value) {
    this.counter.setText(value)
  }
}
