require("dotenv").config();
const { Pool, Client } = require("pg");
import { processNotification } from "./utils/listener";

const {
  DB_HOST: host,
  DB_PORT: port,
  DB_USER: user,
  DB_PASS: password,
  DB_NAME: database,
} = process.env;

const dbConfig = {
  host,
  port: +port,
  user,
  password,
  database,
  idleTimeoutMillis: 100,
  connectionTimeoutMillis: 1000,
};

const pool = new Pool(dbConfig);
const client = new Client(dbConfig);

client
  .connect()
  .then(() => client.query("LISTEN api_channel"))
  .catch((err) => console.error(err.message));

client.on("notification", processNotification);

module.exports = { pool, client };
