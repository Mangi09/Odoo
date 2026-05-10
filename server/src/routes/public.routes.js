const express = require('express');
const { query } = require('../db/pool');
const { ensureTripSectionsTable } = require('../db/bootstrap');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();

router.get('/itineraries/:shareSlug', asyncHandler(async (req, res) => {
  await ensureTripSectionsTable();

  const tripResult = await query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.start_date AS "startDate",
        t.end_date AS "endDate",
        t.cover_photo_url AS "coverPhotoUrl",
        t.base_currency AS "baseCurrency",
        t.total_budget AS "totalBudget",
        t.visibility,
        t.status,
        t.share_slug AS "shareSlug",
        u.full_name AS "ownerName"
      FROM trips t
      JOIN users u ON u.id = t.owner_id
      WHERE t.share_slug = $1
        AND t.visibility = 'public'
      LIMIT 1
    `,
    [req.params.shareSlug]
  );

  const trip = tripResult.rows[0];

  if (!trip) {
    throw createHttpError(404, 'Public itinerary not found');
  }

  const [stopsResult, sectionsResult] = await Promise.all([
    query(
      `
        SELECT
          ts.id,
          ts.city_id AS "cityId",
          c.name AS "cityName",
          c.country,
          c.region,
          c.image_url AS "imageUrl",
          ts.stop_order AS "stopOrder",
          ts.arrival_date AS "arrivalDate",
          ts.departure_date AS "departureDate"
        FROM trip_stops ts
        JOIN cities c ON c.id = ts.city_id
        WHERE ts.trip_id = $1
        ORDER BY ts.stop_order ASC
      `,
      [trip.id]
    ),
    query(
      `
        SELECT
          id,
          section_type AS "sectionType",
          title,
          description,
          start_date AS "startDate",
          end_date AS "endDate",
          budget_amount AS "budgetAmount",
          currency,
          section_order AS "displayOrder"
        FROM trip_sections
        WHERE trip_id = $1
        ORDER BY section_order ASC
      `,
      [trip.id]
    )
  ]);

  res.json({
    itinerary: {
      ...trip,
      stops: stopsResult.rows,
      sections: sectionsResult.rows
    }
  });
}));

module.exports = router;
