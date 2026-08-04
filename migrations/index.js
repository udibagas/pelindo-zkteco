require("dotenv").config();
const fs = require("fs");
const { Pool } = require("pg");
const { argv } = require("process");
const file = argv[2];

if (!file) {
  return console.log("Migration file is required!");
}

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

try {
  const query = fs.readFileSync(`./migrations/${file}`, {
    encoding: "utf-8",
  });
  pool.query(query, (err, result) => {
    if (err) {
      return console.log("Failed to run migration", err.message);
    }
    console.log("Migration success");
  });
} catch (error) {
  console.log(error.message);
}
