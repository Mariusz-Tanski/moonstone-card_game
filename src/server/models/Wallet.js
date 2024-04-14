import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  address: String,
  games: [{
      roomId: String,
      status: { type: String, default: 'ongoing' },
      bid: Number,
      timestamp: { type: String, default: new Date() },
      gameResult: { type: String, default: 'unknown' },
      claimStatus: { type: String, default: 'pending' },
      claimable: { type: Number, default: 0 }
  }]
});

const WalletModel = mongoose.model('Wallet', walletSchema);

export default class Wallet {
  constructor() {
    this.model = new WalletModel();
  }

  static async find(attrs = {}) {
    var model = await WalletModel.findOne(attrs);

    if (model) {
      var instance = new this();
      instance.model = model;
      return instance;
    } else {
      return null;
    }
  }

  static async findOrCreateBy(attrs = {}) {
    var instance = new this();
    instance.model = await WalletModel.findOne(attrs);

    if (!instance.model) {
      instance.model = new WalletModel(attrs);
      await instance.model.save();
    }

    return instance;
  }

  get address() {
    return this.model.address;
  }

  get games() {
    return this.model.games;
  }

  async save() {
    return await this.model.save();
  }

  async addNewRoomData(room) {
    var gameData = { roomId: room.roomId, bid: room.bid }
    this.games.push(gameData);

    return await this.save();
  }

  async markRoomAsFinished(roomId, player) {
    this.games.forEach(game => {
      if (game.roomId == roomId) {
        game.status = 'finished'
        game.gameResult = player.winner ? 'won' : 'lost'
        game.claimable = player.wonAmount
      }
    })

    return await this.save();
  }

  gameAllowed() {
    const ongoingGames =
      this.games.filter(game => { return game.status == 'ongoing'; })

    return ongoingGames.length == 0;
  }
}
