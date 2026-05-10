const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();
const toNull = (value) => (value === undefined || value === '' ? null : value);

router.get('/users', asyncHandler(async (req, res) => {
  const search = req.query.search || '';
  const role = req.query.role || null;

  const result = await query(
    `SELECT
       u.id,
       u.full_name AS "fullName",
       u.username,
       u.email,
       u.phone_number AS "phoneNumber",
       u.city,
       u.country,
       u.role,
       u.avatar_url AS "avatarUrl",
       COUNT(DISTINCT t.id)::int AS "tripCount",
       COUNT(DISTINCT cp.id)::int AS "communityPostCount",
       u.created_at AS "createdAt"
     FROM users u
     LEFT JOIN trips t ON t.owner_id = u.id
     LEFT JOIN community_posts cp ON cp.user_id = u.id
     WHERE
       ($1::text = '' OR u.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR u.role = $2)
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT 100`,
    [search, role]
  );

  res.json({ users: result.rows });
}));

router.get('/users/:userId/trips', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await query(
    `SELECT
       t.id,
       t.title,
       t.start_date AS "startDate",
       t.end_date AS "endDate",
       t.visibility,
       t.status,
       t.total_budget AS "totalBudget",
       COUNT(DISTINCT ts.id)::int AS "destinationCount",
       COALESCE(bs.estimated_total, 0) AS "estimatedTotal"
     FROM trips t
     LEFT JOIN trip_stops ts ON ts.trip_id = t.id
     LEFT JOIN trip_budget_summary bs ON bs.trip_id = t.id
     WHERE t.owner_id = $1
     GROUP BY t.id, bs.estimated_total
     ORDER BY t.created_at DESC`,
    [userId]
  );

  res.json({ trips: result.rows });
}));

router.patch('/users/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, fullName, username, phoneNumber, city, country } = req.body;

  const result = await query(
    `UPDATE users
     SET
       role = COALESCE($2, role),
       full_name = COALESCE($3, full_name),
       username = COALESCE($4, username),
       phone_number = COALESCE($5, phone_number),
       city = COALESCE($6, city),
       country = COALESCE($7, country)
     WHERE id = $1
     RETURNING
       id,
       full_name AS "fullName",
       username,
       email,
       phone_number AS "phoneNumber",
       city,
       country,
       role,
       updated_at AS "updatedAt"`,
    [userId, toNull(role), toNull(fullName), toNull(username), toNull(phoneNumber), toNull(city), toNull(country)]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'User not found');
  }

  res.json({ user: result.rows[0] });
}));

router.delete('/users/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id`,
    [userId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'User not found');
  }

  res.status(204).send();
}));

router.get('/overview', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) AS "userCount",
       (SELECT COUNT(*)::int FROM trips) AS "tripCount",
       (SELECT COUNT(*)::int FROM community_posts) AS "communityPostCount",
       (SELECT COUNT(*)::int FROM activity_reviews) AS "activityReviewCount"`
  );

  res.json({ overview: result.rows[0] });
}));

module.exports = router;
