const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/top-regional-selections', asyncHandler(async (req, res) => {
  const region = req.query.region || null;
  const country = req.query.country || null;
  const limit = Number(req.query.limit || 8);

  const result = await query(
    `SELECT
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
     WHERE
       ($1::text IS NULL OR c.region ILIKE $1)
       AND ($2::text IS NULL OR c.country ILIKE $2)
     GROUP BY c.id
     ORDER BY
       COUNT(DISTINCT ts.id) DESC,
       c.popularity_score DESC,
       COUNT(DISTINCT a.id) DESC,
       c.name ASC
     LIMIT $3`,
    [region, country, limit]
  );

  res.json({ selections: result.rows });
}));

router.get('/places', asyncHandler(async (req, res) => {
  const userId = req.query.userId || null;
  const country = req.query.country || null;
  const maxCostIndex = req.query.maxCostIndex || null;
  const interest = req.query.interest || null;
  const limit = Number(req.query.limit || 10);

  const result = await query(
    `SELECT
       c.id,
       c.name,
       c.country,
       c.region,
       c.cost_index AS "costIndex",
       c.popularity_score AS "popularityScore",
       c.image_url AS "imageUrl",
       COUNT(DISTINCT ts.id)::int AS "tripCount",
       COUNT(DISTINCT a.id)::int AS "matchingActivityCount",
       CASE
         WHEN $1::uuid IS NOT NULL AND sc.city_id IS NOT NULL THEN true
         ELSE false
       END AS "isSavedByUser"
     FROM cities c
     LEFT JOIN trip_stops ts ON ts.city_id = c.id
     LEFT JOIN activities a
       ON a.city_id = c.id
       AND a.is_active = true
       AND ($4::text IS NULL OR a.category = $4)
     LEFT JOIN saved_cities sc
       ON sc.city_id = c.id
       AND sc.user_id = $1
     WHERE
       ($2::text IS NULL OR c.country ILIKE $2)
       AND ($3::numeric IS NULL OR c.cost_index <= $3::numeric)
     GROUP BY c.id, sc.city_id
     ORDER BY
       CASE WHEN sc.city_id IS NOT NULL THEN 0 ELSE 1 END,
       COUNT(DISTINCT ts.id) DESC,
       COUNT(DISTINCT a.id) DESC,
       c.popularity_score DESC,
       c.name ASC
     LIMIT $5`,
    [userId, country, maxCostIndex, interest, limit]
  );

  res.json({ places: result.rows });
}));

router.get('/activities', asyncHandler(async (req, res) => {
  const cityId = req.query.cityId || null;
  const category = req.query.category || null;
  const maxCost = req.query.maxCost || null;
  const limit = Number(req.query.limit || 10);

  const result = await query(
    `SELECT
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
       COUNT(DISTINCT ta.id)::int AS "timesAddedToTrips",
       COALESCE(ars.review_count, 0)::int AS "reviewCount",
       ars.average_rating AS "averageRating"
     FROM activities a
     JOIN cities c ON c.id = a.city_id
     LEFT JOIN trip_activities ta ON ta.activity_id = a.id
     LEFT JOIN activity_review_summary ars ON ars.activity_id = a.id
     WHERE
       a.is_active = true
       AND ($1::uuid IS NULL OR a.city_id = $1)
       AND ($2::text IS NULL OR a.category = $2)
       AND ($3::numeric IS NULL OR a.estimated_cost <= $3::numeric)
     GROUP BY a.id, c.name, c.country, ars.review_count, ars.average_rating
     ORDER BY
       COUNT(DISTINCT ta.id) DESC,
       ars.average_rating DESC NULLS LAST,
       a.estimated_cost ASC,
       a.name ASC
     LIMIT $4`,
    [cityId, category, maxCost, limit]
  );

  res.json({ activities: result.rows });
}));

module.exports = router;
