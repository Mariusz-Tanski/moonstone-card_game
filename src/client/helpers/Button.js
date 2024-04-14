export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);

    options.width = options.width || 250;
    options.height = options.height || 50;
    options.text = options.text || '';
    this.scene = scene;

    var graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xffffff);
    graphics.strokeRect(
      0 - options.width / 2 , 0 - options.height / 2,
      options.width, options.height
    );

    this.text =
      this.scene.add.text(
        0, 0, [options.text],
      ).setFontSize(15).
        setColor('#e3e3e3').
        setOrigin(0.5, 0.5).
        setFontFamily('"8Bit"')

    this.setSize(options.width, options.height);
    this.add(graphics);
    this.add(this.text);
    this.setInteractive({ useHandCursor: true });

    this.scene.add.existing(this);
  }

  setText(text) {
    this.text.setText(text)
  }

  show() {
    this.setVisible(true);
    this.setInteractive(true);
  }

  hide() {
    this.setVisible(false);
    this.setInteractive(false);
  }
}
