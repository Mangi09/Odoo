const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth.routes');
const cityRoutes = require('./cities.routes');
const tripRoutes = require('./trips.routes');
const publicRoutes = require('./public.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  const result = await query('SELECT now() AS "databaseTime"');

  res.json({
    status: 'ok',
    databaseTime: result.rows[0].databaseTime
  });
}));

router.use('/auth', authRoutes);
router.use('/cities', cityRoutes);
router.use('/trips', tripRoutes);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
