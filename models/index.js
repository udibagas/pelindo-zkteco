const pool = require("../config/db");
const LogResult = require("./logresult");

class Model {
  static async getLastTransaction() {
    const query = `
      SELECT
        t.id as id,
        t.dev_id as device_id,
        t.event_time as time,
        t.pin as driver_id,
        t.name as driver_name,
        -- t.certificate_number, 
        t.vid_linkage_handle as photopath
      FROM acc_transaction t
      JOIN pers_person p ON t.pin = p.pin
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
}

module.exports = Model;
