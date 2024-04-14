import Button from "./Button"

export default class Intro {
  constructor(scene) {
    this.scene = scene
    this.load()
  }

  load() {
    var { width, height } = this.scene.cameras.main

    this.video = this.scene.add.video(0, 0, 'intro')
    .setOrigin(0, 0)
    .setDepth(9000)
    .on('complete', this.afterPlay, this)

    this.skipButton = new Button(
      this.scene,
      width - 150, height - 50,
      { text: 'Skip' }
    )
    .setDepth(9001)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', this.afterPlay, this)
    .setVisible(false)

    this.playButton = new Button(
      this.scene,
      width / 2, height / 2,
      { text: 'To the moon!' }
    )
    .setDepth(9001)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', this.play, this)
  }

  play() {
    this.playButton.setVisible(false)
    this.skipButton.setVisible(true)
    this.video.play()
  }

  afterPlay() {
    this.scene.scene.start('prepareGame')
  }
}
