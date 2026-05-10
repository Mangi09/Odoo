const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth.routes');
const cityRoutes = require('./cities.routes');
const tripRoutes = require('./trips.routes');
const userRoutes = require('./users.routes');
const recommendationRoutes = require('./recommendations.routes');
const publicRoutes = require('./public.routes');
const analyticsRoutes = require('./analytics.routes');
const adminRoutes = require('./admin.routes');
const activitiesRoutes = require('./activities.routes');
const communityRoutes = require('./community.routes');

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
router.use('/recommendations', recommendationRoutes);
router.use('/trips', tripRoutes);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/activities', activitiesRoutes);
router.use('/community', communityRoutes);

router.get('/invoices', asyncHandler(async (req, res) => {
  const ownerId = typeof req.query.userId === 'string' ? req.query.userId : null;

  const tripsResult = await query(
    `SELECT
       t.id,
       t.title,
       t.description,
       t.start_date AS "startDate",
       t.end_date AS "endDate",
       t.total_budget AS "totalBudget",
       COALESCE(bs.estimated_total, 0) AS "estimatedTotal",
       COALESCE(bs.actual_total, 0) AS "actualTotal"
     FROM trips t
     LEFT JOIN trip_budget_summary bs ON bs.trip_id = t.id
     WHERE ($1::uuid IS NULL OR t.owner_id = $1::uuid)
     ORDER BY COALESCE(bs.actual_total, bs.estimated_total, 0) DESC, t.created_at DESC`,
    [ownerId]
  );

  if (!tripsResult.rows.length) {
    return res.json([]);
  }

  const tripIds = tripsResult.rows.map((trip) => trip.id);
  const expensesResult = await query(
    `SELECT
       trip_id AS "tripId",
       category,
       label,
       COALESCE(actual_amount, estimated_amount, 0) AS amount,
       estimated_amount AS "estimatedAmount",
       actual_amount AS "actualAmount",
       expense_date AS "expenseDate"
     FROM trip_expenses
     WHERE trip_id = ANY($1::uuid[])
     ORDER BY expense_date ASC NULLS LAST, created_at ASC`,
    [tripIds]
  );

  const expensesByTrip = new Map();
  for (const expense of expensesResult.rows) {
    if (!expensesByTrip.has(expense.tripId)) {
      expensesByTrip.set(expense.tripId, []);
    }
    expensesByTrip.get(expense.tripId).push(expense);
  }

  const invoices = tripsResult.rows.map((trip) => {
    const lineItems = expensesByTrip.get(trip.id) || [];
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const budget = Number(trip.totalBudget || trip.totalbudget || trip.total_budget || trip.totalBudget || subtotal);

    return {
      id: trip.id,
      invoiceId: `INV-${trip.id.slice(0, 8).toUpperCase()}`,
      title: trip.title,
      tripTitle: trip.title,
      date: trip.endDate || trip.startDate || new Date().toISOString().slice(0, 10),
      travelers: [],
      status: 'Pending',
      budget,
      subtotal,
      tax: 0,
      discount: 0,
      total: subtotal,
      items: lineItems.map((item) => ({
        id: item.expenseDate || item.label,
        category: item.category,
        description: item.label,
        qty: 1,
        unit: Number(item.amount || 0),
        amount: Number(item.amount || 0)
      }))
    };
  });

  res.json(invoices);
}));

router.get('/invoices/:invoiceId/pdf', (req, res) => {
  res.status(501).json({ error: 'PDF export is not available yet' });
});

router.post('/invoices/:invoiceId/paid', (req, res) => {
  res.json({ invoiceId: req.params.invoiceId, status: 'paid' });
});

module.exports = router;
