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

  logger.info(`New data: ${JSON.stringify(data)}`);

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
  const query = `SELECT ip_address FROM acc_device WHERE id = $1 `;
  const { rows, rowCount } = await pool.query(query, [dev_id]);
  if (rowCount === 0) throw new Error("Device not found");
  return rows[0];
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
