const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth.routes');
const cityRoutes = require('./cities.routes');
const tripRoutes = require('./trips.routes');
const publicRoutes = require('./public.routes');
const analyticsRoutes = require('./analytics.routes');
const userRoutes = require('./users.routes');
const communityRoutes = require('./community.routes');
const activityRoutes = require('./activities.routes');
const adminRoutes = require('./admin.routes');
const recommendationRoutes = require('./recommendations.routes');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  const result = await query('SELECT now() AS "databaseTime"');

  res.json({
    status: 'ok',
    databaseTime: result.rows[0].databaseTime
  });
}));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/activities', activityRoutes);
router.use('/trips', tripRoutes);
router.use('/community', communityRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
