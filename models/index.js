const pool = require("../config/db");
const LogResult = require("./logresult");

class Model {
  static async getLastTransaction() {
    const query = `
      SELECT
        *
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
