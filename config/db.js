require("dotenv").config();
const { Pool } = require("pg");

const {
  DB_HOST: host,
  DB_PORT: port,
  DB_USER: user,
  DB_PASS: password,
  DB_NAME: database,
} = process.env;

const pool = new Pool({
  host,
  port: +port,
  user,
  password,
  database,
  idleTimeoutMillis: 100,
  connectionTimeoutMillis: 1000,
});

module.exports = pool;
