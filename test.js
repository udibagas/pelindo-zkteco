const pool = require("./config/db");

const query = `
  SELECT *
  FROM acc_transaction t
  JOIN pers_person p ON t.pin = p.pin
  WHERE dev_alias ILIKE 'kiosk%'
  order by t.create_time desc
  LIMIT 1
`;

pool.query(query, (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
    return;
  }

  console.log(res.rows);
});
