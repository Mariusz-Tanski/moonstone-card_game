import { Client } from "colyseus.js";

export default class Server {
  constructor(scene) {
    this.scene = scene;
    this.client = new Client(this.clientAddress());
    this.events = scene.events;
  }

  clientAddress() {
    const { serverHost, serverPort } = this.scene.game.config;
    var port = serverPort ? ':' + serverPort : '';

    return "ws://" + serverHost + port;
  }

  joinRoom() {
    this.client.joinOrCreate(
      'game_room',
      {
        address: this.scene.address,
        bid: this.scene.bid,
        players: this.scene.maxPlayers
      }
    ).then(room => {
      this.room = room;
      console.log(room.sessionId, "joined", room.id);
      this.events.emit('connected-to-server', room.id)

      room.onMessage('player-joined', (count) => {
        this.events.emit('player-joined', count)
      });
      room.onMessage('hand-dealed', (players) => {
        this.events.emit('hand-dealed', players.player, players.oponents)
      });
      room.onMessage('round-begin', (hand) => {
        this.events.emit('round-started', hand)
      });
      room.onMessage('player-activated', (id) => {
        this.events.emit('player-activated', id)
      });
      room.onMessage('card-selected', (data) => {
        this.events.emit('card-selected', data)
      });
      room.onMessage('table-updated', (size) => {
        this.events.emit('table-updated', size)
      });
      room.onMessage('table-revealed', (table) => {
        this.events.emit('table-revealed', table)
      });
      room.onMessage('player-won-round', (winnerId) => {
        this.events.emit('player-won-round', winnerId)
      });
      room.onMessage('player-won-game', (winnerId) => {
        this.events.emit('player-won-game', winnerId)
      });
      room.onMessage('card-autopicked', (cardIndex) => {
        this.events.emit('card-autopicked', cardIndex)
      });
      room.onMessage('reset-waiting-for-players-timer', (resetAt) => {
        this.events.emit('reset-waiting-for-players-timer', resetAt)
      });
    }).catch(e => {
      console.log("JOIN ERROR", e);
    });
  }

  cardSelected(card) {
    this.room.send('card-selected', { name: card.name, mass: card.mass });
  }

  depositRequested() {
    this.room.send('deposit-requested');
  }

  depositDone() {
    this.room.send('deposit-done');
  }

  depositDeclined() {
    this.room.send('deposit-declined');
  }

  onConnected(callback) {
    this.events.off('connected-to-server')
    this.events.once('connected-to-server', callback, this.scene );
  }

  onPlayerJoined(callback) {
    this.events.off('player-joined')
    this.events.on('player-joined', callback, this.scene);
  }

  onHandDealed(callback) {
    this.events.off('hand-dealed')
    this.events.once('hand-dealed', callback, this.scene)
  }

  onRoundStarted(callback) {
    this.events.off('round-started')
    this.events.on('round-started', callback, this.scene);
  }

  onPlayerActivated(callback) {
    this.events.off('player-activated')
    this.events.on('player-activated', callback, this.scene);
  }

  onCardSelected(callback) {
    this.events.off('card-selected')
    this.events.on('card-selected', callback, this.scene);
  }

  onTableUpdated(callback) {
    this.events.off('table-updated')
    this.events.on('table-updated', callback, this.scene);
  }

  onTableRevealed(callback) {
    this.events.off('table-revealed')
    this.events.on('table-revealed', callback, this.scene);
  }

  onPlayerWonRound(callback) {
    this.events.off('player-won-round')
    this.events.on('player-won-round', callback, this.scene);
  }

  onPlayerWonGame(callback) {
    this.events.off('player-won-game')
    this.events.once('player-won-game', callback, this.scene);
  }

  onCardAutoPicked(callback) {
    this.events.off('card-autopicked')
    this.events.on('card-autopicked', callback, this.scene);
  }

  onResetWaitingTimer(callback) {
    this.events.off('reset-waiting-for-players-timer')
    this.events.on('reset-waiting-for-players-timer', callback, this.scene);
  }
}
