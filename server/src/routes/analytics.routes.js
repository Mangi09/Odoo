const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { getLimit } = require('../utils/request');

const router = express.Router();

router.get('/popular-cities', asyncHandler(async (req, res) => {
  const limit = getLimit(req.query.limit, 10, 50);

  const result = await query(
    `
      SELECT
        c.id,
        c.name,
        c.country,
        c.region,
        c.image_url AS "imageUrl",
        c.popularity_score AS "popularityScore",
        COUNT(DISTINCT ts.id)::int AS "timesAddedToTrips"
      FROM cities c
      LEFT JOIN trip_stops ts ON ts.city_id = c.id
      GROUP BY c.id
      ORDER BY "timesAddedToTrips" DESC, c.popularity_score DESC, c.name ASC
      LIMIT $1
    `,
    [limit]
  );

  res.json({ cities: result.rows });
}));

router.get('/trips-per-month', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::int AS "tripCount"
    FROM trips
    GROUP BY date_trunc('month', created_at)
    ORDER BY month ASC
  `);

  res.json({ trends: result.rows });
}));

router.get('/top-activities', asyncHandler(async (req, res) => {
  const limit = getLimit(req.query.limit, 10, 50);

  const result = await query(
    `
      SELECT
        COALESCE(a.id, ta.activity_id) AS id,
        ta.title,
        COALESCE(a.category, 'other') AS category,
        COUNT(ta.id)::int AS "timesAddedToTrips",
        AVG(ta.cost)::numeric(10, 2) AS "averageCost"
      FROM trip_activities ta
      LEFT JOIN activities a ON a.id = ta.activity_id
      GROUP BY COALESCE(a.id, ta.activity_id), ta.title, COALESCE(a.category, 'other')
      ORDER BY "timesAddedToTrips" DESC, ta.title ASC
      LIMIT $1
    `,
    [limit]
  );

  res.json({ activities: result.rows });
}));

module.exports = router;
