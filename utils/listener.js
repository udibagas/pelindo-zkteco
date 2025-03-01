const axios = require("axios");
const getSnapshot = require("./snapshot");
const { moveFile } = require("./samba");
const LogResult = require("../models/logresult");
const { API_URL, API_USER: username, API_PASS: password } = process.env;

const lastData = { pin: "", name: "" };
let timeout;

async function processNotification(msg, pool) {
  const data = JSON.parse(msg.payload);

  if (!data.dev_alias?.toLowerCase().includes("kiosk")) {
    throw new Error("Device not a kiosk, skipping...");
  }

  if (data.pin === lastData.pin && data.name === lastData.name) {
    throw new Error("Duplicate notification, skipping...");
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

  const logResult = LogResult.create(data);

  // pakai promise biar ga blocking
  getDeviceById(data.dev_id, pool)
    .then((device) => {
      return getSnapshot(device.ip_address, logResult.photopath);
    })
    .then((r) => {
      console.log(r);
      return moveFile(`./${logResult.photopath}`, logResult.photopath);
    })
    .then((r) => console.log(r))
    .catch((e) => console.error(e.message));

  return axios
    .post(API_URL, logResult, { auth: { username, password } })
    .then((r) => r.data);
}

async function getDeviceById(dev_id, pool) {
  const query = `SELECT ip_address FROM acc_device WHERE id = $1 `;
  const { rows, rowCount } = await pool.query(query, [dev_id]);
  if (rowCount === 0) throw new Error("Device not found");
  return rows[0];
}

module.exports = { processNotification };
