const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/popular-cities', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       city_id AS "cityId",
       name,
       country,
       times_added_to_trips AS "timesAddedToTrips"
     FROM popular_cities
     LIMIT 10`
  );

  res.json({ cities: result.rows });
}));

router.get('/trips-per-month', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       date_trunc('month', created_at) AS month,
       COUNT(*)::int AS "tripsCreated"
     FROM trips
     GROUP BY month
     ORDER BY month DESC`
  );

  res.json({ months: result.rows });
}));

router.get('/top-activities', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       COALESCE(a.name, ta.title) AS name,
       COUNT(*)::int AS "timesAdded"
     FROM trip_activities ta
     LEFT JOIN activities a ON a.id = ta.activity_id
     GROUP BY COALESCE(a.name, ta.title)
     ORDER BY "timesAdded" DESC, name ASC
     LIMIT 10`
  );

  res.json({ activities: result.rows });
}));

module.exports = router;
