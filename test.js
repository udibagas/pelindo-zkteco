const pool = require("../config/db");

const query = `
  SELECT * FROM acc_transaction
  WHERE dev_alias ILIKE 'kiosk%'
  order by event_time desc
  LIMIT 1
`;

pool.query(query, (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
    return;
  }

  console.log(res.rows);
});
