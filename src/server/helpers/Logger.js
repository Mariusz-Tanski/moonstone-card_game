const fs = require('fs')
import path from 'path';

export default class Logger {
  static log(...args) {
    var timestamp = new Date();
    console.log(timestamp, args.join(' '));

    const logsPath = path.join(__dirname, '../../../logs/game.log')
    fs.appendFileSync(logsPath, timestamp + args.join(' ') + "\n", 'utf8')
  }
}
