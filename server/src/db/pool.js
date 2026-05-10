const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'traveloop',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres'
    };

const pool = new Pool(poolConfig);

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
