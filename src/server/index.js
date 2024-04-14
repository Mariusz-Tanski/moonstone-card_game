import { Server } from "colyseus";
import mongoose from 'mongoose';
import http from 'http';

import express from './express_config'

import GameRoom from './rooms/GameRoom';
import Logger from "./helpers/Logger";

require('dotenv').config()

const port = Number(process.env.PORT || 2567);
const host = process.env.HOST || 'localhost';

const cert = {}

const server = http.createServer(cert, express);
const gameServer = new Server({ server });

gameServer.define('game_room', GameRoom);
gameServer.listen(port, host);
Logger.log(`Listening on ws://${host}:${port}`)

dbConnect().catch(err => Logger.log(err));
async function dbConnect() {
    const dbURI = process.env.MONGODB_URI;
    await mongoose.connect(dbURI);
}

mongoose.connection.on('connected', () => {
    Logger.log(`Mongoose is connected!!!`)
});
