// import { handPosition } from '../entities/tableHelpers';

export default class DropZone {
  constructor(scene) {
    var { width, height } = scene.cameras.main;
    this.cards = [];

    this.zoneWidth = scene.duel ? 400 : 700;
    this.zoneHeight = 200;

    this.container = scene.add.container(width / 2, height / 2);
    this.container.setSize(this.zoneWidth, this.zoneHeight);

    this.dropZone = scene.add.
      zone(width / 2, height / 2, this.zoneWidth, this.zoneHeight).
      setRectangleDropZone(this.zoneWidth, this.zoneHeight);

    this.dropZoneOutline = scene.add.graphics();
    this.dropZoneOutline.lineStyle(4, 0xff69b4);
    this.dropZoneOutline.strokeRect(
      this.dropZone.x - this.dropZone.input.hitArea.width / 2,
      this.dropZone.y - this.dropZone.input.hitArea.height / 2,
      this.dropZone.input.hitArea.width,
      this.dropZone.input.hitArea.height
    )
  }

  show() {
    this.container.setVisible(true);
    this.dropZoneOutline.setVisible(true);
  }

  hide() {
    this.container.setVisible(false);
    this.dropZoneOutline.setVisible(false);
  }

  clear() {
    this.cards = [];
  }

  disable() {
    this.dropZone.disableInteractive();
  }

  enable() {
    this.dropZone.setInteractive();
  }
}
