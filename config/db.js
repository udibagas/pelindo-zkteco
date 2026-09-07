require("dotenv").config();
const { Pool, Client } = require("pg");
const { processNotification } = require("../utils/listener");
const logger = require("../logger");
const config = require("./config");
const pool = new Pool(config);

let client;

async function connect() {
  const previousClient = client;
  client = new Client(config);

  const cleanupPreviousClient = async () => {
    if (!previousClient) return;

    previousClient.removeAllListeners();

    try {
      await previousClient.end();
    } catch (err) {
      logger.warn(`Error closing previous DB client: ${err.message}`);
    }
  };

  client.on("notification", (msg) => {
    processNotification(msg, pool)
      .then((r) => logger.info(JSON.stringify(r)))
      .catch((err) => logger.error(err.message));
  });

  client.on("error", async (err) => {
    logger.error(err.message);
    await cleanupPreviousClient();
    setTimeout(() => connect(), 3000);
  });

  try {
    await client.connect();
    await client.query("LISTEN api_channel");
    logger.info("Database connected. Listening...");
  } catch (err) {
    logger.error(`Failed to connect to database! ${err.message}`);
    await cleanupPreviousClient();
    setTimeout(() => connect(), 3000);
  }
}

connect();

module.exports = { pool };
