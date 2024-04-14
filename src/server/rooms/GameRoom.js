import { Room } from 'colyseus';
import { Messages } from '../types/messages';
import GameState from './schema/GameState';
import { Dispatcher } from "@colyseus/command";

import PlayerJoinCommand from "../commands/PlayerJoinCommand";
import PlayerLeaveCommand from "../commands/PlayerLeaveCommand";
import CardSelectedCommand from "../commands/CardSelectedCommand";
import DepositRequestedCommand from '../commands/DepositRequestedCommand';
import DepositDoneCommand from '../commands/DepositDoneCommand';

import Wallet from '../models/Wallet';
import Contract from '../helpers/Contract';
import Logger from '../helpers/Logger';
import Config from '../models/Config';

export default class GameRoom extends Room {
  async onCreate(options) {
    this.maxClients = options.players || 2;
    this.bid = options.bid;
    this.handSize = 5;
    this.roomId = this.generateRoomId()

    this.dispatcher = new Dispatcher(this);
    this.setState(new GameState(this.handSize));

    await this.initConfig()

    this.autoDispose = false;
    this.contract = new Contract();

    this.setSimulationInterval(dt => this.update(dt), 100);

    this.initEvents();
  }

  async initConfig() {
    this.config = await Config.get()
    const { timeToSelectCard, timeToRequestDeposit, timeToSkipWaitingForPlayers } =
      this.config.roomConfig
    this.timeToSelectCard = timeToSelectCard;
    this.timeToRequestDeposit = timeToRequestDeposit;
    this.timeToSkipWaitingForPlayers = timeToSkipWaitingForPlayers;
  }

  initEvents() {
    this.onMessage(Messages.CardSelected, (client, message) => {
      this.dispatcher.dispatch(new CardSelectedCommand(), {
        client: client, card: message
      })
    });

    this.onMessage(Messages.DepositRequested, (client) => {
      this.dispatcher.dispatch(new DepositRequestedCommand(), { client })
    });

    this.onMessage(Messages.DepositDone, (client) => {
      this.dispatcher.dispatch(new DepositDoneCommand(), { client })
    });

    this.onMessage(Messages.DepositDeclined, (client) => { client.leave(); });
  }

  async onAuth(_, { address }) {
    const validBid =
      Object.values(this.config.bids)
      .includes(Math.floor(this.bid * Math.pow(0.1, 9)))

    var wallet = await Wallet.find({ address: address });
    if (!wallet) return validBid;

    return validBid && wallet.gameAllowed()
  }

  onJoin(client, { address }) {
    Logger.log(`${client.sessionId} joined room ${this.roomId}!`);
    this.dispatcher.dispatch(new PlayerJoinCommand(), { client, address })
  }

  onLeave(client, _) {
    Logger.log(`${client.sessionId} left ${this.roomId}!`);
    return new Promise(() => {
      this.dispatcher.dispatch(new PlayerLeaveCommand(), {
        sessionId: client.sessionId
      });
    });
  }

  onDispose() {
    Logger.log("room", this.roomId, "disposing...");
  }

  update(delta) {
    if (this.state.waitingForCardPick && this.cardPickWaitingCounter > this.timeToSelectCard) {
      this.dispatcher.dispatch(new CardSelectedCommand())
    }
    this.cardPickWaitingCounter += delta;

    if (this.state.waitingForPlayers && this.playersWaitingCounter > this.timeToSkipWaitingForPlayers) {
      this.dispatcher.dispatch(new PlayerJoinCommand(), { bots: true })
    }
    this.playersWaitingCounter += delta;
  }

  resetWaitForCardPickCounter() {
    this.state.waitingForCardPick = true;
    this.cardPickWaitingCounter = 0;
  }

  resetWaitForPlayersCounter() {
    this.state.waitingForPlayers = true;
    this.playersWaitingCounter = 0;
    this.broadcast('reset-waiting-for-players-timer',
                   new Date().getTime() + this.timeToSkipWaitingForPlayers)
  }

  generateRoomId() {
    return Math.floor(Math.random() * new Date().getTime())
  }
}
