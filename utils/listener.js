const axios = require("axios");
const getSnapshot = require("./snapshot");
const LogResult = require("../models/logresult");
const logger = require("../logger");
const moveFile = require("./ftp");
const { API_URL, API_USER: username, API_PASS: password } = process.env;

const lastData = { pin: "", name: "", dev_id: "" };
let timeout;

async function processNotification(msg, pool) {
  const data = JSON.parse(msg.payload);

  if (!data.dev_alias?.toLowerCase().includes("kiosk")) {
    return "Device not a kiosk, skipping...";
  }

  if (
    data.pin === lastData.pin &&
    data.name === lastData.name &&
    data.dev_id === lastData.dev_id
  ) {
    return "Duplicate notification, skipping...";
  }

  logger.info(`New notification: ${JSON.stringify(data)}`);

  lastData.pin = data.pin;
  lastData.name = data.name;
  lastData.dev_id = data.dev_id;

  if (timeout !== undefined) {
    clearTimeout(timeout);
  }

  // reset data after 5 minutes
  timeout = setTimeout(() => {
    lastData.pin = "";
    lastData.name = "";
    lastData.dev_id = "";
  }, 60_000 * 5);

  const logResult = LogResult.create(data);

  // pakai promise biar ga blocking
  getDeviceById(data.dev_id, pool)
    .then((device) => {
      return getSnapshot(device.ip_address, logResult.photopath);
    })
    .then((r) => {
      logger.info(JSON.stringify(r));
      return moveFile(`.${logResult.photopath}`, logResult.photopath);
    })
    .then((r) => logger.info(JSON.stringify(r)))
    .catch((e) => logger.error(e.message));

  logger.info(`Sending data to api: ${JSON.stringify(logResult)}`);

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
