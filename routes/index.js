const router = require("express").Router();
const { pool } = require("../config/db");

router.get("/logs", (req, res) => {
  let { keyword, date } = req.query;

  let query = `SELECT * FROM "api_logs" WHERE 1 = 1`;

  if (keyword) {
    query += `
      AND
        driver_id ILIKE '%${keyword}%' OR
        driver_name ILIKE '%${keyword}%' OR
        device_id ILIKE '%${keyword}%'
    `;
  }

  if (date) {
    query += `
      AND time BETWEEN '${date} 00:00:00' AND '${date} 23:59:59.9999'
    `;
  }

  query += " ORDER BY id DESC";

  if (!date) {
    query += " LIMIT 100";
  }

  pool.query(query, (err, result) => {
    if (err) {
      return res.render("logs", { err, rows: [], date, keyword });
    }

    const { rows } = result;
    // const rows = [
    //   {
    //     id: 1,
    //     log_id: "hfweiuhfiefw",
    //     time: "20:01",
    //     device_id: "KiosK 01",
    //     driver_name: "Bagas",
    //     driver_id: "22431234342",
    //     response_status: true,
    //     api_response: {
    //       code: 200,
    //       message: "OK",
    //     },
    //     raw_log: {
    //       ok: "sip",
    //     },
    //     api_payload: {
    //       jos: "gandos",
    //     },
    //   },
    //   {
    //     id: 2,
    //     device_id: 1,
    //     driver_name: "Bagas",
    //     driver_id: 12,
    //     response_status: false,
    //   },
    //   {
    //     id: 3,
    //     device_id: 1,
    //     driver_name: "Bagas",
    //     driver_id: 12,
    //     response_status: true,
    //   },
    //   {
    //     id: 4,
    //     device_id: 1,
    //     driver_name: "Bagas",
    //     driver_id: 12,
    //     response_status: null,
    //   },
    // ];

    res.render("logs", { err, rows, date, keyword });
  });
});

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

router.use("/api", require("./api"));

module.exports = router;
