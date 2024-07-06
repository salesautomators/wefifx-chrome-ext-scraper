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
  console.log(event.area);

  if (event.area && event.area.length > 0) {
    try {
      const res = await pool.query(
        `SELECT "review_link" FROM "google_local_locations" WHERE "area" = '${event.area.toLowerCase().trim()}'`
      );

      console.log(res.rows);

      if (res.rows && res.rows.length > 0) {
        return {
          body: { found: true, link: res.rows[0].review_link },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      } else {
        const def = await pool.query(`SELECT "review_link" FROM "google_local_locations" WHERE "id" = 21`);

        return {
          body: { found: true, link: def.rows[0].review_link },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }
    } catch (error) {
      console.error(error);
      return {
        body: { found: false, msg: error },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }
}

exports.main = main;
