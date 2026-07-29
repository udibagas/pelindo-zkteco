const fs = require("fs");
const { pool } = require("../config/db");

const query = fs.readFileSync("./migrations/schema.sql", { encoding: "utf-8" });

pool.query(query, (err, result) => {
  if (err) {
    return console.log("Failed to run migration", err.message);
  }

  console.log("Migration success");
});
