const axios = require("axios");
const getSnapshot = require("./snapshot");
const LogResult = require("../models/logresult");
const logger = require("../logger");
const { moveFile } = require("./ftp");
const { API_URL, API_USER: username, API_PASS: password } = process.env;

// cached last data grouped by dev_id
// lastData = {
//   xxx: {
//     pin: "x",
//     name: "x",
//     dev_id: "x",
//   },
//   yyy: {
//     ...
//   },
//   ...
// };

const lastData = {};

// timeoutIds = {
//   dev_id_a: ...,
//   dev_id_b: ...,
//   ...,
// }
const timeoutIds = {};

// cached devices
// devices = {
//   x: { id: 'x', 'name', 'x', ...},
//   x: { id: 'x', 'name', 'x', ...},
//   ...
// }
const devices = {};

async function processNotification(msg, pool) {
  const data = JSON.parse(msg.payload);

  if (!data.dev_alias?.toLowerCase().includes("kiosk")) {
    return "Device not a kiosk, skipping...";
  }

  logger.info(`New data: ${JSON.stringify(data)}`);

  const { pin, name, dev_id } = data;

  if (!lastData[dev_id]) {
    lastData[dev_id] = {};
  }

  if (
    pin === lastData[dev_id].pin &&
    name === lastData[dev_id].name &&
    dev_id === lastData[dev_id].dev_id
  ) {
    return "Duplicate data. Skipped.";
  }

  // data baru
  lastData[dev_id].pin = pin;
  lastData[dev_id].name = name;
  lastData[dev_id].dev_id = dev_id;

  // clear timeout kalau ada data yang baru
  if (timeoutIds[dev_id]) {
    clearTimeout(timeoutIds[dev_id]);
  }

  // reset data after 5 minutes
  timeoutIds[dev_id] = setTimeout(() => {
    lastData[dev_id].pin = "";
    lastData[dev_id].name = "";
    lastData[dev_id].dev_id = "";
  }, 60_000 * 5);

  const logResult = LogResult.create(data);

  // pakai promise biar ga blocking
  getDeviceById(data.dev_id, pool)
    .then((device) => {
      return getSnapshot(device.ip_address, logResult.photopath);
    })
    .then((r) => {
      logger.info(JSON.stringify(r));
      return moveFile(`./${logResult.photopath}`, logResult.photopath);
    })
    .then((r) => logger.info(JSON.stringify(r)))
    .catch((e) => logger.error(e.message));

  const log = await saveLog(data, logResult, pool);

  logger.info(`Sending data to api: ${JSON.stringify(logResult)}`);

  return axios
    .post(API_URL, logResult, { auth: { username, password } })
    .then(async (r) => {
      await updateLog(r.data, log.id, true, pool);
      return r.data;
    })
    .catch(async (e) => {
      await updateLog(
        e.response?.data ?? { message: e.message },
        log.id,
        false,
        pool,
      );
      throw e;
    });
}

async function getDeviceById(dev_id, pool) {
  const cachedDevice = devices[dev_id];

  if (cachedDevice) {
    return cachedDevice;
  }

  const query = `SELECT ip_address FROM acc_device WHERE id = $1 `;
  const { rows, rowCount } = await pool.query(query, [dev_id]);
  if (rowCount === 0) throw new Error("Device not found");
  const device = rows[0];

  // cache to memory
  devices[dev_id] = device;
  return device;
}

async function saveLog(data, logResult, pool) {
  const query = `
    INSERT INTO "api_logs"
      (log_id, time, device_id, driver_id, driver_name, raw_log, api_payload)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const res = await pool.query(query, [
    logResult.id,
    logResult.time,
    logResult.device_id,
    logResult.driver_id,
    logResult.driver_name,
    data,
    logResult,
  ]);

  return res.rows[0];
}

async function updateLog(data, id, status, pool) {
  const query = `
    UPDATE "api_logs"
    SET
      api_response = $1,
      response_status = $2
    WHERE id = $3
  `;

  return pool.query(query, [JSON.stringify(data), status, id]);
}

module.exports = { processNotification };
