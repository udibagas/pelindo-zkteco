const { Router } = require("express");
const { pool } = require("../config/db");
const exportExcel = require("../utils/excel");
const router = new Router();

router.get("/logs", async (req, res) => {
  let { keyword, from, to, action } = req.query;

  let query = `SELECT id, time, device_id, driver_name, driver_id, response_status FROM "api_logs" WHERE 1 = 1`;
  const params = [];

  if (keyword) {
    query += `
      AND (
        driver_id ILIKE $1 OR
        driver_name ILIKE $1 OR
        device_id ILIKE $1
      )
    `;

    params.push(`%${keyword}%`);
  }

  if (from && to) {
    from = `${from} 00:00:00`;
    to = `${to} 23:59:59.9999`;
    query += " AND time BETWEEN $X AND $Y";
    params.push(from, to);
  }

  query += " ORDER BY id DESC";

  if (!from) {
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

    if (action == "export") {
      const workbook = exportExcel(
        rows.map((r) => ({
          time: r.time.toLocaleString("id-ID"),
          gate: r.device_id,
          driver_name: r.driver_name,
          driver_id: r.driver_id,
          status: r.response_status,
        })),
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader("Content-Disposition", "attachment; filename=logs.xlsx");

      await workbook.xlsx.write(res);
      return res.end();
    }

    res.render("logs", { err: null, rows, from, to, keyword });
  } catch (err) {
    res.render("logs", { err, rows: [], from, to, keyword });
  }
});

router.get("/logs/:id", async (req, res) => {
  const { id } = req.params;
  let query = `SELECT * FROM "api_logs" WHERE id = $1`;

  try {
    const result = await pool.query(query, [id]);
    if (result.rowCount == 0) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
