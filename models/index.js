const pool = require("../config/db");
const LogResult = require("./logresult");

class Model {
  static async getLastTransaction() {
    const query = `
      SELECT
        *
        // t.event_time as time,
        // p.id_card,
        // p.name,
        // p.last_name,
        // p.gender,
        // p.department,
        // p.photo_path,
        // p.auth_dept_id,
        // p.initial_name
      FROM acc_transaction t
      JOIN pers_person p ON t.pin = p.pin
      ORDER BY id DESC
      LIMIT 1
    `;

    const { rows, rowCount } = await pool.query(query);

    if (rowCount === 0) {
      return null;
    }

    console.log(rows[0]);
    return LogResult.create(rows[0]);
  }
}

module.exports = Model;
