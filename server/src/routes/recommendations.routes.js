const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { getLimit } = require('../utils/request');

const router = express.Router();

router.get('/top-regional-selections', asyncHandler(async (req, res) => {
  const limit = getLimit(req.query.limit, 6, 30);

  const result = await query(
    `
      SELECT
        c.id,
        c.name,
        c.country,
        c.region,
        c.cost_index AS "costIndex",
        c.popularity_score AS "popularityScore",
        c.image_url AS "imageUrl",
        COUNT(DISTINCT ts.id)::int AS "tripCount",
        COUNT(DISTINCT a.id)::int AS "activityCount"
      FROM cities c
      LEFT JOIN trip_stops ts ON ts.city_id = c.id
      LEFT JOIN activities a ON a.city_id = c.id AND a.is_active = true
      GROUP BY c.id
      ORDER BY
        COUNT(DISTINCT ts.id) DESC,
        c.popularity_score DESC,
        c.name ASC
      LIMIT $1
    `,
    [limit]
  );

  res.json({ selections: result.rows });
}));

router.get('/places', asyncHandler(async (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : null;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const limit = getLimit(req.query.limit, 12, 50);

  const result = await query(
    `
      SELECT
        c.id,
        c.name,
        c.country,
        c.region,
        c.cost_index AS "costIndex",
        c.popularity_score AS "popularityScore",
        c.latitude,
        c.longitude,
        c.image_url AS "imageUrl",
        COUNT(DISTINCT a.id)::int AS "activityCount",
        COUNT(DISTINCT ts.id)::int AS "tripCount",
        (sc.user_id IS NOT NULL) AS "isSaved",
        (
          c.popularity_score
          + COUNT(DISTINCT ts.id) * 8
          + COUNT(DISTINCT a.id) * 2
          + CASE WHEN sc.user_id IS NOT NULL THEN 15 ELSE 0 END
          - c.cost_index
        )::numeric(10, 2) AS "recommendationScore"
      FROM cities c
      LEFT JOIN activities a ON a.city_id = c.id AND a.is_active = true
      LEFT JOIN trip_stops ts ON ts.city_id = c.id
      LEFT JOIN saved_cities sc ON sc.city_id = c.id AND ($1::uuid IS NOT NULL AND sc.user_id = $1::uuid)
      WHERE (
        $2 = ''
        OR c.name ILIKE '%' || $2 || '%'
        OR c.country ILIKE '%' || $2 || '%'
        OR COALESCE(c.region, '') ILIKE '%' || $2 || '%'
      )
      GROUP BY c.id, sc.user_id
      ORDER BY "recommendationScore" DESC, c.name ASC
      LIMIT $3
    `,
    [userId, search, limit]
  );

  res.json({ places: result.rows });
}));

router.get('/activities', asyncHandler(async (req, res) => {
  const cityId = typeof req.query.cityId === 'string' ? req.query.cityId : null;
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const limit = getLimit(req.query.limit, 8, 50);

  const result = await query(
    `
      SELECT
        a.id,
        a.city_id AS "cityId",
        c.name AS "cityName",
        c.country,
        a.name,
        a.category,
        a.description,
        a.estimated_cost AS "estimatedCost",
        a.currency,
        a.duration_minutes AS "durationMinutes",
        a.image_url AS "imageUrl",
        c.popularity_score AS "cityPopularityScore"
      FROM activities a
      JOIN cities c ON c.id = a.city_id
      WHERE a.is_active = true
        AND ($1::uuid IS NULL OR a.city_id = $1::uuid)
        AND ($2 = '' OR a.category = $2)
      ORDER BY c.popularity_score DESC, a.estimated_cost ASC, a.name ASC
      LIMIT $3
    `,
    [cityId, category, limit]
  );

  res.json({ activities: result.rows });
}));

module.exports = router;
