const { Pool } = require('pg');

const { DB_HOST: host, DB_PORT: port, DB_DATABASE: database, DB_USER: user, DB_PASSWORD: password } = process.env;

const pool = new Pool({
  host,
  port,
  database,
  user,
  password,
});

async function main(event) {
  try {
    const res = await pool.query('SELECT * FROM google_local_urls');

    console.log(res.rows);

    return {
      body: { selected: true, rows: res.rows },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error(error);
    return {
      body: { inserted: false, msg: error },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}

exports.main = main;
