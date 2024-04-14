import express from 'express';
import cors from 'cors';
import path from 'path';
import { monitor } from "@colyseus/monitor";
import morgan from 'morgan';

import contractABI from './helpers/contract_abi';
import tokenABI from './helpers/token_abi';
import Wallet from './models/Wallet';
import Config from './models/Config';

const app = express();
const rfs = require('rotating-file-stream')
app.use("/colyseus", monitor());

var corsOptions = { origin: 'http://localhost:8080' } // dev

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.set('view engine', 'pug')

rfs.createStream('game.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '../../logs')
})
const serverLogStream = rfs.createStream('server.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '../../logs')
})
app.use(morgan('combined', { stream: serverLogStream }))

app.get('/status', cors(corsOptions), (_, res) => {
    Config.get()
    .then((config) => {
        const resp = { status: '', message: ''}
        if (config.maintenance) {
            resp.status = 'not_ok'
            resp.message = 'Server is currently under maintenance'
        } else {
            resp.status = 'ok'
            resp.bids = config.bids
        }
        res.send(resp);
    })
});

app.get('/abi', cors(corsOptions), (_, res) => {
    res.send({ contract: contractABI, token: tokenABI });
});

app.get('/wallet/:address', cors(corsOptions), (req, res) => {
    var resp = { status: 'not_found' }
    Wallet.find({ address: req.params.address })
    .then(wallet => {
        if (wallet) {
            if (wallet.gameAllowed()) {
                resp.status = 'ok'
            } else {
                resp.status = 'game_in_progress'
            }
        }
        res.send(resp)
    })
});

app.get("/", (_, res) => { res.render('index') })

export default app;
