const axios = require("axios");
const getSnapshot = require("../utils/snapshot");
const { moveFile } = require("../utils/samba");
const Model = require("../models");
const { API_URL, API_USER: username, API_PASS: password } = process.env;

const lastData = { pin: "", name: "" };
let timeout;

async function processNotification(msg) {
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
    if (!logResult) return console.log("Data not found");

    // pakai promise biar ga blocking
    axios
      .post(API_URL, logResult, { auth: { username, password } })
      .then(() => console.log("Data sent to API"))
      .catch((err) => console.error(err.message));

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
}

module.exports = { processNotification };
