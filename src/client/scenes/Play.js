import Server from '../services/Server';
import Table from '../entities/Table'
import Player from '../entities/Player';
import InfoText from '../helpers/InfoText';
import AnimatedImages from './AnimatedImages';
import BugReportLink from './BugReportLink';

export default class Play extends Phaser.Scene {
  constructor() {
    super({ key: 'play' });
  }

  create(data) {
    new AnimatedImages(this);
    new BugReportLink(this);


    this.infoText = new InfoText(this);
    this.address = data.address;
    this.bid = data.bid;
    this.duel = data.duel;
    this.maxPlayers = data.duel ? 2 : 4;
    this.handSize = 5;

    if (!this.server) this.server = new Server(this);

    this.setupServerEvents();
    this.server.joinRoom(data.room);
  }

  setupServerEvents() {
    this.server.onConnected(this.requestDeposit);
    this.server.onPlayerJoined(this.updateWaitingPlayersText);
    this.server.onHandDealed(this.prepareGame);
    this.server.onRoundStarted(this.startRound);
    this.server.onPlayerActivated(this.activatePlayer);
    this.server.onCardSelected(this.updateOponentsHands);
    this.server.onTableUpdated(this.updateTable);
    this.server.onTableRevealed(this.revealTable);
    this.server.onPlayerWonRound(this.updateScore);
    this.server.onPlayerWonGame(this.endGame);
    this.server.onCardAutoPicked(this.autoPickCard);
    this.server.onResetWaitingTimer(this.resetWaitingTimer);
  }

  updateWaitingPlayersText(count) {
    this.infoText.setText(`Waiting for players... ${count}/${this.maxPlayers}`);
  }

  prepareGame(player, oponents) {
    this.table = new Table(this)
    this.player = new Player(this, true);
    this.player.id = player.id;

    this.oponents = [];
    oponents.forEach(oponent => {
      var op = new Player(this, false);
      op.id = oponent.id;
      this.oponents.push(op);
    });

    this.players = [this.player].concat(this.oponents);

    this.infoText.setText('Game is about to start...');
    this.createUI();
    this.player.hand.update(player.hand);
  }

  createUI() {
    var { width, height } = this.cameras.main;

    this.player.initHand(width / 2, height - 150, 0);
    this.player.initScoreText(width / 2 + 150, height - 300);
    this.player.initNameText(width / 2 - 150, height - 300);

    this.oponents.forEach((oponent, index) => {
      switch (index) {
        case 0:
          oponent.initHand(width / 2, 150, 180);
          oponent.initScoreText(width / 2 + 150, 280);
          oponent.initNameText(width / 2 - 150, 280)
          break;
        case 1:
          oponent.initHand(150, height / 2, 90);
          oponent.initScoreText(145, 70);
          oponent.initNameText(145, height - 85);
          break;
        case 2:
          oponent.initHand(width - 150, height / 2, -90);
          oponent.initScoreText(width - 145, 70);
          oponent.initNameText(width - 145, height - 85)
          break;
        default:
          break;
      }
    });
  }

  startRound() {
    this.infoText.hide();
    this.player.hand.show();
    this.table.clear();
  }

  activatePlayer(id) {
    this.players.forEach(player => {
      if (player.id == id) {
        player.hand.activate()
      } else {
        player.hand.deactivate();
      }
    });
  }

  updateOponentsHands(data) {
    if (data.id == this.player.id) return;
    var oponent = this.oponents.find(o => o.id == data.id);
    oponent.hand.cards[data.cardIndex].hide();
    oponent.hand.deactivate();
  }

  updateTable(size) {
    this.table.update(size);
  }

  revealTable(table) {
    this.table.reveal(table);
  }

  updateScore(winnerId) {
    var player = this.players.find(p => p.id == winnerId);
    player.updateScore();
  }

  endGame(winnerId) {
    this.time.addEvent({
      delay: 2500,
      callback: ()=> { this.scene.start('endGame', { winnerId }) },
      loop: false
  	})
  }

	autoPickCard(cardIndex) {
    this.table.dropZone.disable();
		this.player.hand.autoPick(cardIndex);
	}

  requestDeposit(roomId) {
    this.infoText.show();
    this.infoText.setText('Awaiting deposit confirmation...');

    this.game.config.contract.methods
    .payDeposit(this.bid, roomId)
    .estimateGas({ from: this.address })
    .catch((error) => console.log(error))
    .then(gas => { this.payDeposit(gas, roomId) })
  }

  payDeposit(gas, roomId) {
    this.game.config.contract.methods
    .payDeposit(this.bid, roomId)
    .send({ from: this.address, gas: gas })
    .on('sent', () => this.server.depositRequested())
    .on('receipt', () => this.server.depositDone())
    .on('error', (error) => {
      if (error.code == 4001) {
        this.server.depositDeclined();
        this.scene.start('prepareGame');
      }
      console.log(error)
    })
  }

  resetWaitingTimer(resetAt) {
    this.waitUntil = new Date(resetAt)
  }

  update() {
    if (this.waitUntil) {
      let secondsLeft = (this.waitUntil.getTime() - new Date().getTime()) / 1000
      if (secondsLeft < 0) {
        this.waitUntil = null
      } else {
        this.infoText.setCounter(Math.round(secondsLeft))
      }
    }
  }
}
