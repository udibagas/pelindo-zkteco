const axios = require("axios");
const getSnapshot = require("../utils/snapshot");
const { moveFile } = require("../utils/samba");
const { client } = require("../config/db");
const Model = require("../models");
const { API_URL, API_USER: username, API_PASS: password } = process.env;

function listener() {
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

      if (!data.dev_alias?.toLowerCase().includes("kiosk")) {
        console.log("Device not a kiosk, skipping...");
        return;
      }

      if (data.pin === lastData.pin && data.name === lastData.name) {
        console.log("Duplicate notification, skipping...");
        return;
      }

      console.log("New notification:", data);

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

      const logResult = await Model.getById(data.id);

      // most likely will never happen
      if (!logResult) {
        console.log("Data not found in database");
        return;
      }

      // sengaja ga pake async await
      axios
        .post(API_URL, logResult, { auth: { username, password } })
        .then(() => console.log("Data sent to API"))
        .catch((err) => console.error(err.message));

      // pakai promise biar ga blocking
      getSnapshot(logResult.ip_address, logResult.photopath)
        .then((r) => {
          console.log(r);
          return moveFile(`.${logResult.photopath}`, logResult.photopath);
        })
        .then((r) => console.log(r))
        .catch((e) => console.error(e.message));
    } catch (error) {
      console.error("Error processing notification:", error.message);
    }
  });
}

module.exports = listener;
