const express = require('express');
const apiRouter = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error');

const createApp = () => {
  const app = express();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });

  app.use(express.json({ limit: '1mb' }));

  app.get('/', (req, res) => {
    res.json({
      name: 'Traveloop API',
      status: 'running',
      health: '/api/health'
    });
  });

  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
