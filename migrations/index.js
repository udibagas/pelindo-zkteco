const fs = require("fs");
const { pool } = require("../config/db");
const { argv } = require("process");
const file = argv[2];

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
