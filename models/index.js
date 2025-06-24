const { pool } = require("../config/db");
const LogResult = require("./logresult");

class Model {
  static async getLastDataByDevice(device) {
    const query = `
      SELECT id, dev_alias, event_time, pin, name, vid_linkage_handle
      FROM acc_transaction
      WHERE dev_alias = $1
      ORDER BY event_time DESC
      LIMIT 1
    `;

    const { rows, rowCount } = await pool.query(query, [device]);

    if (rowCount === 0) {
      return null;
    }

    return LogResult.create(rows[0]);
  }

  static async getAlldevice() {
    const query = `SELECT id, dev_alias, ip_address FROM acc_device WHERE dev_alias ILIKE 'kiosk%' `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getPerson() {
    const query = `
      SELECT
        pers_person.*,
        auth_department.name AS department
      FROM pers_person
      JOIN auth_department
        ON pers_person.auth_dept_id = auth_department.id
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getPersonById(id) {
    const query = `
      SELECT
        pers_person.*,
        auth_department.name AS department
      FROM pers_person
      JOIN auth_department
        ON pers_person.auth_dept_id = auth_department.id
      WHERE pers_person.id = $1
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }
}

module.exports = Model;
