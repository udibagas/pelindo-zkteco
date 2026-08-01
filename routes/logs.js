const { Router } = require("express");
const { pool } = require("../config/db");
const exportExcel = require("../utils/excel");
const router = new Router();

router.get("/logs", async (req, res) => {
  const defaultPageSize = 100;
  const maxPageSize = 1000;

  let {
    keyword,
    from,
    to,
    action,
    page = 1,
    pageSize = defaultPageSize,
  } = req.query;

  let query = `SELECT id, time, device_id, driver_name, driver_id, response_status FROM "api_logs"`;
  let where = " WHERE 1 = 1";
  const params = [];

  if (keyword) {
    where +=
      " AND (driver_id ILIKE $1 OR driver_name ILIKE $1 OR device_id ILIKE $1)";
    params.push(`%${keyword}%`);
  }

  if (from && to) {
    from = `${from} 00:00:00`;
    to = `${to} 23:59:59.9999`;
    where += " AND time BETWEEN $X AND $Y";
    params.push(from, to);
  }

  query += where;
  query += " ORDER BY id DESC";

  // pagination
  pageSize =
    isNaN(Number(pageSize)) || pageSize > maxPageSize
      ? defaultPageSize
      : Number(pageSize);

  query += ` LIMIT ${pageSize}`;

  page = isNaN(Number(page)) || page < 1 ? 1 : Number(page);
  const skip = (page - 1) * pageSize;
  query += ` OFFSET ${skip}`;

  if (params.length == 2) {
    query = query.replace("X", "1").replace("Y", "2");
  }

  if (params.length == 3) {
    query = query.replace("X", "2").replace("Y", "3");
  }

  // default value for pagination
  let total = 0;
  let dataFrom = 0;
  let dataTo = page * pageSize;
  let prevPage = page - 1;
  let nextPage = page + 1;

  try {
    const { rows } = await pool.query(query, params);

    const { rows: rowsCount } = await pool.query(
      `SELECT COUNT(id) FROM "api_logs" ${where}`,
    );

    total = rowsCount[0].count;
    dataFrom = (page - 1) * pageSize + 1;

    if (page * pageSize > total) {
      dataTo = total;
      nextPage = 0;
    }

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

    res.render("logs", {
      err: null,
      rows,
      from,
      to,
      keyword,
      page,
      pageSize,
      total,
      dataFrom,
      dataTo,
      prevPage,
      nextPage,
    });
  } catch (err) {
    res.render("logs", {
      err,
      rows: [],
      from,
      to,
      keyword,
      page,
      pageSize,
      total,
      dataFrom,
      dataTo,
      prevPage,
      nextPage,
    });
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
