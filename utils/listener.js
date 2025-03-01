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

  const {
    id,
    dev_id,
    dev_alias: device_id,
    event_time: time,
    pin: driver_id,
    name: driver_name,
    vid_linkage_handle: photopath,
  } = data;

  const logResult = LogResult.create({
    id,
    device_id,
    time,
    driver_id,
    driver_name,
    photopath,
  });

  // pakai promise biar ga blocking
  axios
    .post(API_URL, logResult, { auth: { username, password } })
    .then((r) => console.log("Data sent to API", r.data))
    .catch((err) => console.error(err.message));

  const { ip_address } = await getDeviceById(dev_id, pool);

  getSnapshot(ip_address, logResult.photopath)
    .then((r) => {
      console.log(r);
      return moveFile(`.${logResult.photopath}`, logResult.photopath);
    })
    .then((r) => console.log(r))
    .catch((e) => console.error(e.message));
}

async function getDeviceById(dev_id, pool) {
  const query = `SELECT * FROM acc_device WHERE id = $1 `;
  const { rows, rowCount } = await pool.query(query, [dev_id]);
  if (rowCount === 0) throw new Error("Device not found");
  return rows[0];
}

module.exports = { processNotification };
