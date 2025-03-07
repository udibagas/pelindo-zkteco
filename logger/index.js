const moment = require("moment");
const winston = require("winston");
const Transport = require("winston-transport");
const { WebSocketServer } = require("ws");

class WebSocketTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.ws = null;
    this.wss = new WebSocketServer({ port: 8090 });

    this.wss.on("connection", (ws) => {
      this.ws = ws;
    });
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    if (!this.ws) {
      return callback();
    }

    this.ws.send(JSON.stringify(info));
    callback();
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      const formattedTimestamp = moment(timestamp).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      return `${formattedTimestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [new winston.transports.Console(), new WebSocketTransport()],
});

module.exports = logger;
