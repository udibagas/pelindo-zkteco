const { Pool } = require("pg");
const config = require("./config/config");

const pool = new Pool({ ...config, idleTimeoutMillis: 10 });
const [tableName] = process.argv.slice(2);

const sql = `SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = $1
ORDER BY
    ordinal_position;`;

pool.query(sql, [tableName], (err, res) => {
  if (err) {
    console.error(err);
    return;
  }
  console.table(res.rows);
});
