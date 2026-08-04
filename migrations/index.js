const fs = require("fs");
const { Pool } = require("pg");
const { argv } = require("process");
const config = require("../config/config");
const file = argv[2];

if (!file) {
  return console.log("Migration file is required!");
}

const pool = new Pool(config);

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
