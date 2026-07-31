const { Router } = require("express");
const { pool } = require("../config/db");
const router = new Router();

router.get("/transactions", (req, res) => {
  let { keyword, date } = req.query;

  let query = `SELECT id, event_time, dev_alias, name, pin FROM "acc_transaction" WHERE dev_alias ILIKE '%kiosk%'`;

  if (keyword) {
    query += `
      AND
        name ILIKE '%${keyword}%' OR
        pin ILIKE '%${keyword}%' OR
        dev_alias ILIKE '%${keyword}%'
    `;
  }

  if (date) {
    query += `
      AND event_time BETWEEN '${date} 00:00:00' AND '${date} 23:59:59.9999'
    `;
  }

  query += " ORDER BY event_time DESC";

  if (!date) {
    query += " LIMIT 100";
  }

  pool.query(query, (err, result) => {
    if (err) {
      return res.render("transactions", { err, rows: [], date, keyword });
    }

    const { rows } = result;

    res.render("transactions", { err, rows, date, keyword });
  });
});

router.get("/transactions/:id", (req, res) => {
  const { id } = req.params;
  let query = `SELECT * FROM "acc_transaction" WHERE id = $1`;

  pool.query(query, [id], (err, result) => {
    if (err) {
      return res.status(404).json({ message: "Data not found" });
    }

    const { rows } = result;
    res.json(rows[0]);
  });
});

module.exports = router;
