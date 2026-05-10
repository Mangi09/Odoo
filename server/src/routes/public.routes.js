const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();

router.get('/itineraries/:shareSlug', asyncHandler(async (req, res) => {
  const { shareSlug } = req.params;

  const tripResult = await query(
    `SELECT
       t.id,
       t.title,
       t.description,
       t.start_date AS "startDate",
       t.end_date AS "endDate",
       t.cover_photo_url AS "coverPhotoUrl",
       t.share_slug AS "shareSlug",
       u.full_name AS "ownerName"
     FROM trips t
     JOIN users u ON u.id = t.owner_id
     WHERE t.share_slug = $1 AND t.visibility = 'public'`,
    [shareSlug]
  );

  if (!tripResult.rows[0]) {
    throw createHttpError(404, 'Public itinerary not found');
  }

  const itineraryResult = await query(
    `SELECT
       c.name AS "cityName",
       c.country,
       ts.stop_order AS "stopOrder",
       ts.arrival_date AS "arrivalDate",
       ts.departure_date AS "departureDate",
       ta.title AS "activityTitle",
       ta.scheduled_date AS "scheduledDate",
       ta.start_time AS "startTime",
       ta.end_time AS "endTime",
       ta.cost,
       ta.currency
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     LEFT JOIN trip_activities ta ON ta.stop_id = ts.id
     WHERE ts.trip_id = $1
     ORDER BY ts.stop_order, ta.scheduled_date, ta.start_time`,
    [tripResult.rows[0].id]
  );

  res.json({
    trip: tripResult.rows[0],
    itinerary: itineraryResult.rows
  });
}));

module.exports = router;
