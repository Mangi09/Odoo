const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { getLimit } = require('../utils/request');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const limit = getLimit(req.query.limit, 30, 100);

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
        COUNT(DISTINCT a.id)::int AS "activityCount"
      FROM cities c
      LEFT JOIN activities a ON a.city_id = c.id AND a.is_active = true
      WHERE (
        $1 = ''
        OR c.name ILIKE '%' || $1 || '%'
        OR c.country ILIKE '%' || $1 || '%'
        OR COALESCE(c.region, '') ILIKE '%' || $1 || '%'
      )
      GROUP BY c.id
      ORDER BY c.popularity_score DESC, c.name ASC
      LIMIT $2
    `,
    [search, limit]
  );

  res.json({ cities: result.rows });
}));

router.get('/:cityId/activities', asyncHandler(async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const limit = getLimit(req.query.limit, 50, 100);

  const cityResult = await query('SELECT id FROM cities WHERE id = $1', [req.params.cityId]);

  if (cityResult.rowCount === 0) {
    throw createHttpError(404, 'City not found');
  }

  const result = await query(
    `
      SELECT
        id,
        city_id AS "cityId",
        name,
        category,
        description,
        estimated_cost AS "estimatedCost",
        currency,
        duration_minutes AS "durationMinutes",
        image_url AS "imageUrl"
      FROM activities
      WHERE city_id = $1
        AND is_active = true
        AND ($2 = '' OR category = $2)
      ORDER BY estimated_cost ASC, name ASC
      LIMIT $3
    `,
    [req.params.cityId, category, limit]
  );

  res.json({ activities: result.rows });
}));

module.exports = router;
