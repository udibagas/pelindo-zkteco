require("dotenv").config();

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
  idleTimeoutMillis: 1_000,
  connectionTimeoutMillis: 3_000,
};

module.exports = config;
