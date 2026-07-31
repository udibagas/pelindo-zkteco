const { Router } = require("express");
const { pool } = require("../config/db");
const exportExcel = require("../utils/excel");
const router = new Router();

router.get("/transactions", async (req, res) => {
  let { keyword, from, to, action } = req.query;

  let query = `SELECT id, event_time, dev_alias, name, pin FROM "acc_transaction" WHERE dev_alias ILIKE '%kiosk%'`;
  const params = [];

  if (keyword) {
    query += `
      AND (
        name ILIKE $1 OR
        pin ILIKE $1 OR
        dev_alias ILIKE $1
      )
    `;

    params.push(`%${keyword}%`);
  }

  if (from && to) {
    from = `${from} 00:00:00`;
    to = `${to} 23:59:59.9999`;
    query += " AND event_time BETWEEN $X AND $Y ";
    params.push(from, to);
  }

  query += " ORDER BY event_time DESC";

  if (!from || !to) {
    query += " LIMIT 100";
  }

  if (params.length == 2) {
    query = query.replace("X", "1").replace("Y", "2");
  }

  if (params.length == 3) {
    query = query.replace("X", "2").replace("Y", "3");
  }

  try {
    const { rows } = await pool.query(query, params);

    const workbook = exportExcel(
      rows.map((r) => ({
        time: r.event_time,
        gate: r.dev_alias,
        driver_name: r.name,
        driver_id: r.pin,
      })),
      false,
    );

    if (action == "export") {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.xlsx",
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    res.render("transactions", { err: null, rows, from, to, keyword });
  } catch (err) {
    return res.render("transactions", { err, rows: [], from, to, keyword });
  }
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
