const { pool } = require("../config/db");
const LogResult = require("./logresult");

class Model {
  static async getLastDataByDevice(device) {
    const query = `
      SELECT
        t.id as id,
        t.dev_alias as device_id,
        t.event_time as time,
        t.pin as driver_id,
        t.name as driver_name,
        t.vid_linkage_handle as photopath
      FROM acc_transaction t
      JOIN acc_device d ON t.dev_alias = d.dev_alias
      WHERE t.dev_alias = $1
      ORDER BY t.event_time DESC
      LIMIT 1
    `;

    const { rows, rowCount } = await pool.query(query, [device]);

    if (rowCount === 0) {
      return null;
    }

    return LogResult.create(rows[0]);
  }

  static async getAlldevice() {
    const query = `SELECT id, dev_alias FROM acc_device WHERE dev_alias ILIKE 'kiosk%' `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getDeviceById(dev_id) {
    const query = `SELECT * FROM acc_device WHERE id = $1 `;
    const { rows, rowCount } = await pool.query(query, [dev_id]);
    if (rowCount === 0) return null;
    return rows[0];
  }
}

module.exports = Model;
