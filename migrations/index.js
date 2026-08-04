const fs = require("fs");
const { Pool } = require("pg");
const { argv } = require("process");
const config = require("../config/config");
const file = argv[2];

const fileExists = fs.existsSync(`./migrations/${file}`);

if (!file || !fileExists) {
  const files = fs
    .readdirSync("./migrations")
    .filter((f) => ![".", "index.js"].includes(f));

  if (!file) {
    console.log("Migration file is required!\n");
  }

  if (!fileExists) {
    console.log("Invalid migration file!\n");
  }

  console.log("Available migrations files:");

  files.forEach((f, i) => {
    console.log(`${++i}. ${f}`);
  });

  return;
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
    console.log("Migration success!");
  });
} catch (error) {
  console.log(error.message);
}
