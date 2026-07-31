const { Router } = require("express");
const { pool } = require("../config/db");
const exportExcel = require("../utils/excel");
const router = new Router();

router.get("/logs", async (req, res) => {
  let { keyword, from, to, action } = req.query;

  let query = `SELECT * FROM "api_logs" WHERE 1 = 1`;

  if (keyword) {
    query += `
      AND
        driver_id ILIKE '%${keyword}%' OR
        driver_name ILIKE '%${keyword}%' OR
        device_id ILIKE '%${keyword}%'
    `;
  }

  if (from) {
    query += `
      AND time BETWEEN '${from} 00:00:00' AND '${to} 23:59:59.9999'
    `;
  }

  query += " ORDER BY id DESC";

  if (!from) {
    query += " LIMIT 100";
  }

  const { rows } = await pool.query(query);

  try {
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

module.exports = router;
