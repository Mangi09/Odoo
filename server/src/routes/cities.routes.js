const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const search = req.query.search || req.query.q || '';
  const country = req.query.country || null;

  const result = await query(
    `SELECT
       id,
       name,
       country,
       region,
       cost_index AS "costIndex",
       popularity_score AS "popularityScore",
       latitude,
       longitude,
       image_url AS "imageUrl"
     FROM cities
     WHERE
       ($1::text = '' OR name ILIKE '%' || $1 || '%' OR country ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR country ILIKE $2)
     ORDER BY popularity_score DESC, name ASC
     LIMIT 30`,
    [search, country]
  );

  res.json({ cities: result.rows });
}));

router.get('/:cityId/activities', asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  const category = req.query.category || null;
  const maxCost = req.query.maxCost || null;

  const result = await query(
    `SELECT
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
     WHERE
       city_id = $1
       AND is_active = true
       AND ($2::text IS NULL OR category = $2)
       AND ($3::numeric IS NULL OR estimated_cost <= $3::numeric)
     ORDER BY estimated_cost ASC, name ASC`,
    [cityId, category, maxCost]
  );

  res.json({ activities: result.rows });
}));

module.exports = router;
