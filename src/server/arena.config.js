import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import express from 'express';
import path from 'path';

/**
 * Import your Room files
 */
import GameRoom from './rooms/GameRoom';
import SmallBidRoom from "./rooms/SmallBidRoom";
import MediumBidRoom from "./rooms/MediumBidRoom";
import BigBidRoom from "./rooms/BigBidRoom";

module.exports = Arena({
    getId: () => "Moonstone",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('game_room', GameRoom);
        gameServer.define('small_bid_room', SmallBidRoom);
        gameServer.define('medium_bid_room', MediumBidRoom);
        gameServer.define('big_bid_room', BigBidRoom);
    },

    initializeExpress: (app) => {
        app.use(express.static(path.join(__dirname, '../../dist')));

        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }

});
