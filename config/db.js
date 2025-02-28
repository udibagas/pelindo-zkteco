require("dotenv").config();
const { Pool, Client } = require("pg");
const fs = require("fs");
const LogResult = require("../models/logresult");
const axios = require("axios");
const getSnapshot = require("../utils/snapshot");

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

// create function
// pool.query(fs.readFileSync("./config/function.sql", "utf-8"), (err) => {
//   if (err) {
//     console.error("Error running function.sql", err);
//     return;
//   }

//   console.log("Function.sql executed successfully");
// });

// listen for notifications
client
  .connect()
  .then(() => {
    client.query("LISTEN api_channel");
    console.log("Listening for notifications...");
  })
  .catch((err) => console.error("Connection error", err.stack));

const lastData = { pin: "", name: "" };
let timeout;

// process notifications
client.on("notification", async (msg) => {
  try {
    const data = JSON.parse(msg.payload);
    console.log("Received notification:", data);

    if (!data.dev_alias?.toLowerCase().includes("kiosk")) {
      console.log("Device not a kiosk, skipping...");
      return;
    }

    if (data.pin === lastData.pin && data.name === lastData.name) {
      console.log("Duplicate notification, skipping...");
      return;
    }

    lastData.pin = data.pin;
    lastData.name = data.name;

    if (timeout !== undefined) {
      clearTimeout(timeout);
    }

    // reset data after 5 minutes
    timeout = setTimeout(() => {
      lastData.pin = "";
      lastData.name = "";
    }, 60_000 * 5);

    const query = `
      SELECT
        t.id as id,
        t.dev_alias as device_id,
        t.event_time as time,
        t.pin as driver_id,
        t.name as driver_name,
        t.vid_linkage_handle as photopath,
        d.ip_address
      FROM acc_transaction t
      JOIN acc_device d ON t.dev_alias = d.dev_alias
      WHERE t.id = $1
      LIMIT 1
    `;

    const { rows, rowCount } = await pool.query(query, [data.id]);

    if (rowCount === 0) {
      return;
    }

    const logResult = LogResult.create(rows[0]);
    const { API_URL, API_USER: username, API_PASS: password } = process.env;

    // sengaja ga pake async await
    axios
      .post(API_URL, logResult, {
        auth: { username, password },
      })
      .then((res) => {
        console.log("Data sent to API", res.data);
      })
      .catch((err) => {
        console.error("Error sending data to API", err.message);
      });

    // pakai promise biar ga blocking
    getSnapshot(logResult.ip_address, logResult.originalPhotopath)
      .then((r) => {
        console.log(r);
      })
      .catch((e) => {
        console.error(e.message);
      });
  } catch (error) {
    console.error("Error processing notification:", error.message);
  }
});

module.exports = pool;
