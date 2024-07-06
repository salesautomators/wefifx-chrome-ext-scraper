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
  if (!event.profile_id || !event.reviews || event.reviews.length < 1) {
    return {
      body: { inserted: false, msg: error },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  for (let i = 0; i < event.reviews.length; i++) {
    console.log('Iterating');
    try {
      const res = await pool.query(
        'INSERT INTO google_local_reviews (profile_id, customer_name, review, rating) VALUES ($1, $2, $3, $4) ON CONFLICT (customer_name) DO NOTHING',
        [Number(event.profile_id), event.reviews[i].customer, event.reviews[i].review, Number(event.reviews[i].rating)]
      );
      console.log(res);
    } catch (error) {
      console.log(error);
      return {
        body: { inserted: true, msg: error },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  return {
    body: { inserted: true, msg: 'wrote to reviews db' },
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

exports.main = main;
