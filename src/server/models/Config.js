import mongoose from 'mongoose'

const configSchema = new mongoose.Schema({
  maintenance: { type: Number, default: 0 },
  smallBid: { type: Number, default: 1000 },
  mediumBid: { type: Number, default: 10000 },
  bigBid: { type: Number, default: 25000 },
  timeToSelectCard: { type: Number, default: 10000 },
  timeToRequestDeposit: { type: Number, default: 60000 },
  timeToSkipWaitingForPlayers: { type: Number, default: 60000 },
})

const ConfigModel = mongoose.model('Config', configSchema)

export default class Config {
  constructor() {
    this.model = new ConfigModel()
  }

  static async get() {
    let model = await ConfigModel.findOne()
    var instance = new this()

    if (model) {
      instance.model = model
    } else {
      instance.model = new ConfigModel()
      await instance.model.save()
    }
    return instance
  }

  get maintenance() {
    return this.model.maintenance
  }

  get bids() {
    return {
      small: this.model.smallBid,
      medium: this.model.mediumBid,
      big: this.model.bigBid
    }
  }

  get roomConfig() {
    return {
      timeToSelectCard: this.model.timeToSelectCard,
      timeToRequestDeposit: this.model.timeToRequestDeposit,
      timeToSkipWaitingForPlayers: this.model.timeToSkipWaitingForPlayers
    }
  }

  async save() {
    return await this.model.save()
  }
}
