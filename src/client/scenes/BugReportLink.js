export default class BugReportLink {
  constructor(scene) {
    const { height } = scene.cameras.main;
    const link = scene.add.text(10, height - 10, ['Report bug'])
    .setFontSize(20)
    .setColor('#e3e3e3')
    .setOrigin(0, 1)
    .setFontFamily('"8Bit"')

    link.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, link.width, link.height),
      Phaser.Geom.Rectangle.Contains
    )

    this.url = scene.game.config.bugReportUrl
    link.on('pointerup', this.openLink, this)
  }

  openLink() {
    const s = window.open(this.url, '_blank')

    if (s && s.focus) {
      s.focus()
    } else if (!s) {
      window.location.href = this.url
    }
  }
}
