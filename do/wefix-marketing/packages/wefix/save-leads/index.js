const { Pool } = require('pg');

const { DB_HOST: host, DB_PORT: port, DB_DATABASE: database, DB_USER: user, DB_PASSWORD: password } = process.env;

const pool = new Pool({
  host,
  port,
  database,
  user,
  password,
});

const m_names = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

async function main(event) {
  if (!event.profile_id) {
    return {
      body: { inserted: false, msg: error },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  let d = new Date();
  let datesting = m_names[d.getMonth()] + '_' + d.getFullYear();

  if (event.total_spent && event.charged_leads) {
    try {
      const res = await pool.query(
        'INSERT INTO google_local_profile_info (profile_id, total_spent, charged_leads, date_period) VALUES ($1, $2, $3, $4) ON CONFLICT (profile_id, date_period) DO UPDATE SET total_spent = excluded.total_spent, charged_leads = excluded.charged_leads',
        [Number(event.profile_id), event.total_spent, event.charged_leads, datesting]
      );
    } catch (error) {
      console.log(error);
      return {
        body: { inserted: false, msg: error },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  if (event.average_weekly_budget) {
    try {
      const res = await pool.query(
        'INSERT INTO google_local_profile_info (profile_id, average_weekly_budget, weekly_target, previous_7_days, date_period) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (profile_id, date_period) DO UPDATE SET average_weekly_budget = excluded.average_weekly_budget, weekly_target = excluded.weekly_target, previous_7_days = excluded.previous_7_days',
        [Number(event.profile_id), event.average_weekly_budget, event.weekly_target, event.previous_7_days, datesting]
      );
    } catch (error) {
      console.log(error);
      return {
        body: { inserted: false, msg: error },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  if (event.balance) {
    try {
      const res = await pool.query(
        'INSERT INTO google_local_profile_info (profile_id, balance) VALUES ($1, $2) ON CONFLICT (profile_id) DO UPDATE SET balance = excluded.balance',
        [Number(event.profile_id), event.balance]
      );
    } catch (error) {
      console.log(error);
      return {
        body: { inserted: false, msg: error },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  if (event.leads && event.leads.length > 0) {
    for (let i = 0; i < event.leads.length; i++) {
      console.log('Iterating');
      try {
        let d = new Date(event.leads[i].received);
        // let timestamp = Math.round(d.getTime()/1000)
        let timestamp = d.toISOString();

        const res = await pool.query(
          'INSERT INTO google_local_leads (profile_id, phone, customer_name, lead_type, business_category, service_type, status, received) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (phone) DO UPDATE SET status = excluded.status',
          [
            Number(event.profile_id),
            event.leads[i].phone,
            event.leads[i].customer_name,
            event.leads[i].lead_type,
            event.leads[i].business_category,
            event.leads[i].service_type,
            event.leads[i].status,
            timestamp,
          ]
        );
      } catch (error) {
        console.log(error);
        return {
          body: { inserted: false, msg: error },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }
    }

    return {
      body: { inserted: true, msg: 'wrote to leads db' },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}

exports.main = main;
