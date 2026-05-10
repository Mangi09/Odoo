const { loadEnvFile } = require('./src/config/env');

loadEnvFile();

const { createApp } = require('./src/app');
const { pool } = require('./src/db/pool');

const PORT = process.env.PORT || 5000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`Traveloop API running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
