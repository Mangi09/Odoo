const express = require('express');
const { pool, query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();

const toNull = (value) => (value === undefined || value === '' ? null : value);

router.get('/', asyncHandler(async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    throw createHttpError(400, 'ownerId query parameter is required');
  }

  const result = await query(
    `SELECT
       t.id,
       t.owner_id AS "ownerId",
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
       COUNT(DISTINCT ts.id)::int AS "destinationCount",
       COALESCE(bs.estimated_total, 0) AS "estimatedTotal",
       COALESCE(bs.actual_total, 0) AS "actualTotal",
       COALESCE(bs.is_over_estimated_budget, false) AS "isOverEstimatedBudget"
     FROM trips t
     LEFT JOIN trip_stops ts ON ts.trip_id = t.id
     LEFT JOIN trip_budget_summary bs ON bs.trip_id = t.id
     WHERE
       t.owner_id = $1
       OR t.id IN (
         SELECT trip_id
         FROM trip_collaborators
         WHERE user_id = $1
       )
     GROUP BY t.id, bs.estimated_total, bs.actual_total, bs.is_over_estimated_budget
     ORDER BY t.start_date ASC`,
    [ownerId]
  );

  res.json({ trips: result.rows });
}));

router.post('/', asyncHandler(async (req, res) => {
  const {
    ownerId,
    title,
    description,
    startDate,
    endDate,
    coverPhotoUrl,
    totalBudget,
    visibility
  } = req.body;

  if (!ownerId || !title || !startDate || !endDate) {
    throw createHttpError(400, 'ownerId, title, startDate, and endDate are required');
  }

  const result = await query(
    `INSERT INTO trips (
       owner_id,
       title,
       description,
       start_date,
       end_date,
       cover_photo_url,
       total_budget,
       visibility
     )
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::numeric, 0), COALESCE($8, 'private'))
     RETURNING
       id,
       owner_id AS "ownerId",
       title,
       description,
       start_date AS "startDate",
       end_date AS "endDate",
       cover_photo_url AS "coverPhotoUrl",
       total_budget AS "totalBudget",
       visibility,
       status,
       share_slug AS "shareSlug"`,
    [ownerId, title, toNull(description), startDate, endDate, toNull(coverPhotoUrl), toNull(totalBudget), toNull(visibility)]
  );

  res.status(201).json({ trip: result.rows[0] });
}));

router.get('/:tripId', asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const tripResult = await query(
    `SELECT
       id,
       owner_id AS "ownerId",
       title,
       description,
       start_date AS "startDate",
       end_date AS "endDate",
       cover_photo_url AS "coverPhotoUrl",
       base_currency AS "baseCurrency",
       total_budget AS "totalBudget",
       visibility,
       status,
       share_slug AS "shareSlug"
     FROM trips
     WHERE id = $1`,
    [tripId]
  );

  if (!tripResult.rows[0]) {
    throw createHttpError(404, 'Trip not found');
  }

  const stopsResult = await query(
    `SELECT
       ts.id,
       ts.trip_id AS "tripId",
       ts.city_id AS "cityId",
       c.name AS "cityName",
       c.country,
       c.region,
       ts.stop_order AS "stopOrder",
       ts.arrival_date AS "arrivalDate",
       ts.departure_date AS "departureDate",
       ts.lodging_name AS "lodgingName",
       ts.lodging_address AS "lodgingAddress",
       ts.notes
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = $1
     ORDER BY ts.stop_order ASC`,
    [tripId]
  );

  const activitiesResult = await query(
    `SELECT
       id,
       stop_id AS "stopId",
       activity_id AS "activityId",
       title,
       description,
       scheduled_date AS "scheduledDate",
       start_time AS "startTime",
       end_time AS "endTime",
       cost,
       currency,
       notes
     FROM trip_activities
     WHERE trip_id = $1
     ORDER BY scheduled_date ASC, start_time ASC`,
    [tripId]
  );

  const activitiesByStop = new Map();

  for (const activity of activitiesResult.rows) {
    const items = activitiesByStop.get(activity.stopId) || [];
    items.push(activity);
    activitiesByStop.set(activity.stopId, items);
  }

  const stops = stopsResult.rows.map((stop) => ({
    ...stop,
    activities: activitiesByStop.get(stop.id) || []
  }));

  res.json({
    trip: tripResult.rows[0],
    stops
  });
}));

router.post('/:tripId/stops', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const {
    cityId,
    stopOrder,
    arrivalDate,
    departureDate,
    lodgingName,
    lodgingAddress,
    notes
  } = req.body;

  if (!cityId || !arrivalDate || !departureDate) {
    throw createHttpError(400, 'cityId, arrivalDate, and departureDate are required');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let finalStopOrder = stopOrder;

    if (!finalStopOrder) {
      const orderResult = await client.query(
        `SELECT COALESCE(MAX(stop_order), 0) + 1 AS "nextStopOrder"
         FROM trip_stops
         WHERE trip_id = $1`,
        [tripId]
      );
      finalStopOrder = orderResult.rows[0].nextStopOrder;
    }

    const result = await client.query(
      `INSERT INTO trip_stops (
         trip_id,
         city_id,
         stop_order,
         arrival_date,
         departure_date,
         lodging_name,
         lodging_address,
         notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tripId, cityId, finalStopOrder, arrivalDate, departureDate, toNull(lodgingName), toNull(lodgingAddress), toNull(notes)]
    );

    await client.query('COMMIT');

    res.status(201).json({ stop: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.patch('/:tripId/stops/:stopId', asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const {
    cityId,
    stopOrder,
    arrivalDate,
    departureDate,
    lodgingName,
    lodgingAddress,
    notes
  } = req.body;

  const result = await query(
    `UPDATE trip_stops
     SET
       city_id = COALESCE($3, city_id),
       stop_order = COALESCE($4::int, stop_order),
       arrival_date = COALESCE($5::date, arrival_date),
       departure_date = COALESCE($6::date, departure_date),
       lodging_name = COALESCE($7, lodging_name),
       lodging_address = COALESCE($8, lodging_address),
       notes = COALESCE($9, notes)
     WHERE trip_id = $1 AND id = $2
     RETURNING *`,
    [tripId, stopId, toNull(cityId), toNull(stopOrder), toNull(arrivalDate), toNull(departureDate), toNull(lodgingName), toNull(lodgingAddress), toNull(notes)]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Trip stop not found');
  }

  res.json({ stop: result.rows[0] });
}));

router.delete('/:tripId/stops/:stopId', asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;

  const result = await query(
    `DELETE FROM trip_stops
     WHERE trip_id = $1 AND id = $2
     RETURNING id`,
    [tripId, stopId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Trip stop not found');
  }

  res.status(204).send();
}));

router.post('/:tripId/activities', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const {
    stopId,
    activityId,
    title,
    description,
    scheduledDate,
    startTime,
    endTime,
    cost,
    currency,
    notes
  } = req.body;

  if (!stopId || !scheduledDate) {
    throw createHttpError(400, 'stopId and scheduledDate are required');
  }

  let activityDefaults = {};

  if (activityId) {
    const activityResult = await query(
      `SELECT name, description, estimated_cost AS "estimatedCost", currency
       FROM activities
       WHERE id = $1`,
      [activityId]
    );
    activityDefaults = activityResult.rows[0] || {};
  }

  const finalTitle = title || activityDefaults.name;

  if (!finalTitle) {
    throw createHttpError(400, 'title is required when activityId is not provided');
  }

  const result = await query(
    `INSERT INTO trip_activities (
       trip_id,
       stop_id,
       activity_id,
       title,
       description,
       scheduled_date,
       start_time,
       end_time,
       cost,
       currency,
       notes
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7,
       $8,
       COALESCE($9::numeric, 0),
       COALESCE($10, 'USD'),
       $11
     )
     RETURNING *`,
    [
      tripId,
      stopId,
      toNull(activityId),
      finalTitle,
      toNull(description || activityDefaults.description),
      scheduledDate,
      toNull(startTime),
      toNull(endTime),
      toNull(cost ?? activityDefaults.estimatedCost),
      toNull(currency ?? activityDefaults.currency),
      toNull(notes)
    ]
  );

  res.status(201).json({ activity: result.rows[0] });
}));

router.delete('/:tripId/activities/:tripActivityId', asyncHandler(async (req, res) => {
  const { tripId, tripActivityId } = req.params;

  const result = await query(
    `DELETE FROM trip_activities
     WHERE trip_id = $1 AND id = $2
     RETURNING id`,
    [tripId, tripActivityId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Trip activity not found');
  }

  res.status(204).send();
}));

router.get('/:tripId/sections', asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const result = await query(
    `SELECT
       s.id,
       s.trip_id AS "tripId",
       s.stop_id AS "stopId",
       c.name AS "cityName",
       s.section_order AS "sectionOrder",
       s.section_type AS "sectionType",
       s.title,
       s.description,
       s.start_date AS "startDate",
       s.end_date AS "endDate",
       s.budget_amount AS "budgetAmount",
       s.currency,
       s.created_at AS "createdAt",
       s.updated_at AS "updatedAt"
     FROM trip_sections s
     LEFT JOIN trip_stops ts ON ts.id = s.stop_id
     LEFT JOIN cities c ON c.id = ts.city_id
     WHERE s.trip_id = $1
     ORDER BY s.section_order ASC`,
    [tripId]
  );

  res.json({ sections: result.rows });
}));

router.post('/:tripId/sections', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const {
    stopId,
    sectionOrder,
    sectionType,
    title,
    description,
    startDate,
    endDate,
    budgetAmount,
    currency
  } = req.body;

  if (!title) {
    throw createHttpError(400, 'title is required');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let finalSectionOrder = sectionOrder;

    if (!finalSectionOrder) {
      const orderResult = await client.query(
        `SELECT COALESCE(MAX(section_order), 0) + 1 AS "nextSectionOrder"
         FROM trip_sections
         WHERE trip_id = $1`,
        [tripId]
      );
      finalSectionOrder = orderResult.rows[0].nextSectionOrder;
    }

    const result = await client.query(
      `INSERT INTO trip_sections (
         trip_id,
         stop_id,
         section_order,
         section_type,
         title,
         description,
         start_date,
         end_date,
         budget_amount,
         currency
       )
       VALUES (
         $1,
         $2,
         $3,
         COALESCE($4, 'other'),
         $5,
         $6,
         $7,
         $8,
         COALESCE($9::numeric, 0),
         COALESCE($10, 'USD')
       )
       RETURNING
         id,
         trip_id AS "tripId",
         stop_id AS "stopId",
         section_order AS "sectionOrder",
         section_type AS "sectionType",
         title,
         description,
         start_date AS "startDate",
         end_date AS "endDate",
         budget_amount AS "budgetAmount",
         currency`,
      [
        tripId,
        toNull(stopId),
        finalSectionOrder,
        toNull(sectionType),
        title,
        toNull(description),
        toNull(startDate),
        toNull(endDate),
        toNull(budgetAmount),
        toNull(currency)
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({ section: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.patch('/:tripId/sections/:sectionId', asyncHandler(async (req, res) => {
  const { tripId, sectionId } = req.params;
  const {
    stopId,
    sectionOrder,
    sectionType,
    title,
    description,
    startDate,
    endDate,
    budgetAmount,
    currency
  } = req.body;

  const result = await query(
    `UPDATE trip_sections
     SET
       stop_id = COALESCE($3, stop_id),
       section_order = COALESCE($4::int, section_order),
       section_type = COALESCE($5, section_type),
       title = COALESCE($6, title),
       description = COALESCE($7, description),
       start_date = COALESCE($8::date, start_date),
       end_date = COALESCE($9::date, end_date),
       budget_amount = COALESCE($10::numeric, budget_amount),
       currency = COALESCE($11, currency)
     WHERE trip_id = $1 AND id = $2
     RETURNING
       id,
       trip_id AS "tripId",
       stop_id AS "stopId",
       section_order AS "sectionOrder",
       section_type AS "sectionType",
       title,
       description,
       start_date AS "startDate",
       end_date AS "endDate",
       budget_amount AS "budgetAmount",
       currency,
       updated_at AS "updatedAt"`,
    [
      tripId,
      sectionId,
      toNull(stopId),
      toNull(sectionOrder),
      toNull(sectionType),
      toNull(title),
      toNull(description),
      toNull(startDate),
      toNull(endDate),
      toNull(budgetAmount),
      toNull(currency)
    ]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Trip section not found');
  }

  res.json({ section: result.rows[0] });
}));

router.delete('/:tripId/sections/:sectionId', asyncHandler(async (req, res) => {
  const { tripId, sectionId } = req.params;

  const result = await query(
    `DELETE FROM trip_sections
     WHERE trip_id = $1 AND id = $2
     RETURNING id`,
    [tripId, sectionId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Trip section not found');
  }

  res.status(204).send();
}));

router.get('/:tripId/budget', asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const summaryResult = await query(
    `SELECT
       trip_id AS "tripId",
       title,
       total_budget AS "totalBudget",
       estimated_total AS "estimatedTotal",
       actual_total AS "actualTotal",
       estimated_remaining AS "estimatedRemaining",
       is_over_estimated_budget AS "isOverEstimatedBudget"
     FROM trip_budget_summary
     WHERE trip_id = $1`,
    [tripId]
  );

  const breakdownResult = await query(
    `SELECT
       category,
       estimated_total AS "estimatedTotal",
       actual_total AS "actualTotal"
     FROM trip_expense_breakdown
     WHERE trip_id = $1
     ORDER BY estimated_total DESC`,
    [tripId]
  );

  const expensesResult = await query(
    `SELECT
       id,
       trip_id AS "tripId",
       stop_id AS "stopId",
       category,
       label,
       estimated_amount AS "estimatedAmount",
       actual_amount AS "actualAmount",
       currency,
       expense_date AS "expenseDate",
       notes
     FROM trip_expenses
     WHERE trip_id = $1
     ORDER BY expense_date NULLS LAST, created_at DESC`,
    [tripId]
  );

  res.json({
    summary: summaryResult.rows[0] || null,
    breakdown: breakdownResult.rows,
    expenses: expensesResult.rows
  });
}));

router.post('/:tripId/expenses', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const {
    stopId,
    category,
    label,
    estimatedAmount,
    actualAmount,
    currency,
    expenseDate,
    notes
  } = req.body;

  if (!category || !label) {
    throw createHttpError(400, 'category and label are required');
  }

  const result = await query(
    `INSERT INTO trip_expenses (
       trip_id,
       stop_id,
       category,
       label,
       estimated_amount,
       actual_amount,
       currency,
       expense_date,
       notes
     )
     VALUES ($1, $2, $3, $4, COALESCE($5::numeric, 0), $6, COALESCE($7, 'USD'), $8, $9)
     RETURNING *`,
    [tripId, toNull(stopId), category, label, toNull(estimatedAmount), toNull(actualAmount), toNull(currency), toNull(expenseDate), toNull(notes)]
  );

  res.status(201).json({ expense: result.rows[0] });
}));

router.get('/:tripId/packing-items', asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const result = await query(
    `SELECT
       id,
       trip_id AS "tripId",
       item_name AS "itemName",
       category,
       quantity,
       is_packed AS "isPacked"
     FROM packing_items
     WHERE trip_id = $1
     ORDER BY is_packed ASC, category ASC, item_name ASC`,
    [tripId]
  );

  res.json({ items: result.rows });
}));

router.post('/:tripId/packing-items', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { itemName, category, quantity } = req.body;

  if (!itemName) {
    throw createHttpError(400, 'itemName is required');
  }

  const result = await query(
    `INSERT INTO packing_items (trip_id, item_name, category, quantity)
     VALUES ($1, $2, COALESCE($3, 'other'), COALESCE($4::int, 1))
     RETURNING
       id,
       trip_id AS "tripId",
       item_name AS "itemName",
       category,
       quantity,
       is_packed AS "isPacked"`,
    [tripId, itemName, toNull(category), toNull(quantity)]
  );

  res.status(201).json({ item: result.rows[0] });
}));

router.patch('/:tripId/packing-items/:itemId', asyncHandler(async (req, res) => {
  const { tripId, itemId } = req.params;
  const { itemName, category, quantity, isPacked } = req.body;

  const result = await query(
    `UPDATE packing_items
     SET
       item_name = COALESCE($3, item_name),
       category = COALESCE($4, category),
       quantity = COALESCE($5::int, quantity),
       is_packed = COALESCE($6::boolean, is_packed)
     WHERE trip_id = $1 AND id = $2
     RETURNING
       id,
       trip_id AS "tripId",
       item_name AS "itemName",
       category,
       quantity,
       is_packed AS "isPacked"`,
    [tripId, itemId, toNull(itemName), toNull(category), toNull(quantity), isPacked]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Packing item not found');
  }

  res.json({ item: result.rows[0] });
}));

router.delete('/:tripId/packing-items/:itemId', asyncHandler(async (req, res) => {
  const { tripId, itemId } = req.params;

  const result = await query(
    `DELETE FROM packing_items
     WHERE trip_id = $1 AND id = $2
     RETURNING id`,
    [tripId, itemId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Packing item not found');
  }

  res.status(204).send();
}));

router.get('/:tripId/notes', asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const result = await query(
    `SELECT
       id,
       trip_id AS "tripId",
       stop_id AS "stopId",
       created_by AS "createdBy",
       note_date AS "noteDate",
       title,
       body,
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM trip_notes
     WHERE trip_id = $1
     ORDER BY note_date DESC NULLS LAST, created_at DESC`,
    [tripId]
  );

  res.json({ notes: result.rows });
}));

router.post('/:tripId/notes', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { stopId, createdBy, noteDate, title, body } = req.body;

  if (!body) {
    throw createHttpError(400, 'body is required');
  }

  const result = await query(
    `INSERT INTO trip_notes (trip_id, stop_id, created_by, note_date, title, body)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tripId, toNull(stopId), toNull(createdBy), toNull(noteDate), toNull(title), body]
  );

  res.status(201).json({ note: result.rows[0] });
}));

module.exports = router;
