import Phaser from 'phaser';

import Boot from './scenes/Boot';
import PrepareGame from './scenes/PrepareGame';
import Play from './scenes/Play';
import EndGame from './scenes/EndGame';

export default {
  type: Phaser.AUTO,
  parent: 'game-window',
  width: 1600,
  height: 1080,
  scene: [Boot, PrepareGame, Play, EndGame],
  dom: { createContainer: true },
  scale: { mode: Phaser.Scale.FIT }
};
