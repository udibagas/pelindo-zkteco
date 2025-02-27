const pool = require("../config/db");
const LogResult = require("./logresult");

class Model {
  static async getLastTransaction() {
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
      WHERE t.dev_alias ILIKE 'kiosk%'
      ORDER BY t.event_time DESC
      LIMIT 1
    `;

    const { rows, rowCount } = await pool.query(query);

    if (rowCount === 0) {
      return null;
    }

    return LogResult.create(rows[0]);
  }

  static async getLastDataByDevice(device) {
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
    const query = `SELECT dev_alias, ip_address FROM acc_device WHERE dev_alias ILIKE 'kiosk%' `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getLastDataAllDevice() {
    const devices = await this.getAlldevice();

    for (const device of devices) {
      const lastData = await this.getLastDataByDevice(device.dev_alias);
      data.push(lastData);
    }

    return data;
  }
}

module.exports = Model;
