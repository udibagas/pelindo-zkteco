const pool = require("../config/db");
const LogResult = require("./logresult");

class Model {
  async getLasTransaction() {
    const query = "SELECT * FROM transactions ORDER BY id DESC LIMIT 1";
    const { rows, rowCount } = await pool.query(query);

    if (rowCount === 0) {
      return null;
    }

    return LogResult.create(rows[0]);
  }
}

module.exports = Model;
