import Phaser from 'phaser';
import config from './config';

var game = new Phaser.Game(config);

game.config.networkVersion = '97';
game.config.contractAddress = '0xBC7C0fa76b25adD930d81e2C700b99fA085A9dFa';
game.config.tokenAddress = '0x1abd42F3a0F8a60eB28Ca5B5e02710FAb5D3200b';
game.config.serverHost = 'localhost'
game.config.serverPort = 2567
game.config.bugReportUrl = 'https://t.me/MoonStoneGamesBugReport'
