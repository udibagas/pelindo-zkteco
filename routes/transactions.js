const { Router } = require("express");
const { pool } = require("../config/db");
const exportExcel = require("../utils/excel");
const router = new Router();

router.get("/transactions", async (req, res) => {
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

  let query = `SELECT id, event_time, dev_alias, name, pin FROM "acc_transaction"`;
  let where = " WHERE dev_alias ILIKE '%kiosk%'";
  const params = [];

  if (keyword) {
    where += " AND (name ILIKE $1 OR pin ILIKE $1 OR dev_alias ILIKE $1)";

    params.push(`%${keyword}%`);
  }

  if (from && to) {
    from = `${from} 00:00:00`;
    to = `${to} 23:59:59.9999`;
    where += " AND event_time BETWEEN $X AND $Y ";
    params.push(from, to);
  }

  if (params.length == 2) {
    where = where.replace("X", "1").replace("Y", "2");
  }

  if (params.length == 3) {
    where = where.replace("X", "2").replace("Y", "3");
  }

  query += where;
  query += " ORDER BY event_time DESC";

  // skip pagination on export
  if (!action || action !== "export") {
    pageSize =
      isNaN(Number(pageSize)) || pageSize > maxPageSize
        ? defaultPageSize
        : Number(pageSize);

    query += ` LIMIT ${pageSize}`;

    page = isNaN(Number(page)) || page < 1 ? 1 : Number(page);
    const skip = (page - 1) * pageSize;
    query += ` OFFSET ${skip}`;
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
      `SELECT COUNT(id) FROM "acc_transaction" ${where}`,
      params,
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
          time: r.event_time,
          gate: r.dev_alias,
          driver_name: r.name,
          driver_id: r.pin,
        })),
        false,
      );

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

    const responseData = {
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
    };

    if (req.get("Content-Type") == "application/json") {
      return res.json(responseData);
    }

    res.render("transactions", responseData);
  } catch (err) {
    const responseData = {
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
    };

    if (req.get("Content-Type") == "application/json") {
      return res.json(responseData);
    }

    return res.render("transactions", responseData);
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
