const express = require('express');
const { query } = require('../db/pool');
const { ensureUserProfileColumns } = require('../db/bootstrap');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { getLimit, optionalString } = require('../utils/request');

const router = express.Router();

router.get('/overview', asyncHandler(async (req, res) => {
  const [usersResult, tripsResult, citiesResult, activitiesResult] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM users'),
    query('SELECT COUNT(*)::int AS count FROM trips'),
    query('SELECT COUNT(*)::int AS count FROM cities'),
    query('SELECT COUNT(*)::int AS count FROM activities WHERE is_active = true')
  ]);

  res.json({
    overview: {
      users: usersResult.rows[0].count,
      trips: tripsResult.rows[0].count,
      cities: citiesResult.rows[0].count,
      activities: activitiesResult.rows[0].count
    }
  });
}));

router.get('/users', asyncHandler(async (req, res) => {
  await ensureUserProfileColumns();

  const limit = getLimit(req.query.limit, 50, 100);

  const result = await query(
    `
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.role,
        u.city,
        u.country,
        u.created_at AS "createdAt",
        COUNT(t.id)::int AS "tripCount"
      FROM users u
      LEFT JOIN trips t ON t.owner_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  res.json({ users: result.rows });
}));

router.get('/users/:userId/trips', asyncHandler(async (req, res) => {
  const result = await query(
    `
      SELECT
        id,
        title,
        start_date AS "startDate",
        end_date AS "endDate",
        total_budget AS "totalBudget",
        visibility,
        status,
        created_at AS "createdAt"
      FROM trips
      WHERE owner_id = $1
      ORDER BY created_at DESC
    `,
    [req.params.userId]
  );

  res.json({ trips: result.rows });
}));

router.patch('/users/:userId', asyncHandler(async (req, res) => {
  await ensureUserProfileColumns();

  const assignments = [];
  const values = [];

  for (const [bodyKey, column] of Object.entries({ role: 'role', fullName: 'full_name' })) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      values.push(optionalString(req.body[bodyKey]));
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    throw createHttpError(400, 'No admin user fields provided');
  }

  values.push(req.params.userId);

  const result = await query(
    `
      UPDATE users
      SET ${assignments.join(', ')}, updated_at = now()
      WHERE id = $${values.length}
      RETURNING
        id,
        full_name AS "fullName",
        email,
        role,
        city,
        country,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'User not found');
  }

  res.json({ user: result.rows[0] });
}));

module.exports = router;
