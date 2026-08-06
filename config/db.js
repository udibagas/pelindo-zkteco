require("dotenv").config();
const { Pool, Client } = require("pg");
const { processNotification } = require("../utils/listener");
const logger = require("../logger");

const {
  DB_HOST: host,
  DB_PORT: port,
  DB_USER: user,
  DB_PASS: password,
  DB_NAME: database,
} = process.env;

const config = {
  host,
  port: +port,
  user,
  password,
  database,
  idleTimeoutMillis: 100,
  connectionTimeoutMillis: 1000,
};

const pool = new Pool(config);
const client = new Client(config);

function connect() {
  client
    .connect()
    .then(() => {
      logger.info("Database connected. Listening...");
      client.query("LISTEN api_channel");
    })
    .catch((err) => {
      logger.error(`Failed to connect to database!" ${err.message}`);
    });

  client.on("notification", (msg) => {
    processNotification(msg, pool)
      .then((r) => logger.info(JSON.stringify(r)))
      .catch((err) => logger.error(err.message));
  });

  client.on("error", (err) => {
    logger.error(err.message);
    client.removeAllListeners();
    setTimeout(() => connect, 3000);
  });
}

connect();

module.exports = { pool, client };
