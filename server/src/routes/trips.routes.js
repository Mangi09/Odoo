const express = require('express');
const { query } = require('../db/pool');
const { ensureTripSectionsTable } = require('../db/bootstrap');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const {
  getLimit,
  optionalNumber,
  optionalString,
  requiredString
} = require('../utils/request');

const router = express.Router();

const tripSummaryFields = `
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
  t.created_at AS "createdAt",
  t.updated_at AS "updatedAt",
  COUNT(DISTINCT ts.city_id)::int AS "destinationCount",
  COALESCE(bs.estimated_total, 0) AS "estimatedTotal",
  COALESCE(bs.actual_total, 0) AS "actualTotal",
  COALESCE(bs.estimated_remaining, t.total_budget) AS "estimatedRemaining",
  COALESCE(bs.is_over_estimated_budget, false) AS "isOverEstimatedBudget"
`;

const tripSummaryJoins = `
  LEFT JOIN trip_stops ts ON ts.trip_id = t.id
  LEFT JOIN trip_budget_summary bs ON bs.trip_id = t.id
`;

const tripSummaryGroup = `
  GROUP BY
    t.id,
    bs.estimated_total,
    bs.actual_total,
    bs.estimated_remaining,
    bs.is_over_estimated_budget
`;

const sectionFields = `
  id,
  trip_id AS "tripId",
  section_type AS "sectionType",
  title,
  description,
  start_date AS "startDate",
  end_date AS "endDate",
  budget_amount AS "budgetAmount",
  currency,
  section_order AS "displayOrder",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const getTripSummary = async (tripId) => {
  const result = await query(
    `
      SELECT ${tripSummaryFields}
      FROM trips t
      ${tripSummaryJoins}
      WHERE t.id = $1
      ${tripSummaryGroup}
    `,
    [tripId]
  );

  return result.rows[0];
};

const requireTrip = async (tripId) => {
  const trip = await getTripSummary(tripId);

  if (!trip) {
    throw createHttpError(404, 'Trip not found');
  }

  return trip;
};

router.get('/', asyncHandler(async (req, res) => {
  const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : null;
  const limit = getLimit(req.query.limit, 50, 100);

  const result = await query(
    `
      SELECT ${tripSummaryFields}
      FROM trips t
      ${tripSummaryJoins}
      WHERE ($1::uuid IS NULL OR t.owner_id = $1::uuid)
      ${tripSummaryGroup}
      ORDER BY t.created_at DESC
      LIMIT $2
    `,
    [ownerId, limit]
  );

  res.json({ trips: result.rows });
}));

router.post('/', asyncHandler(async (req, res) => {
  const ownerId = requiredString(req.body.ownerId, 'ownerId');
  const title = requiredString(req.body.title, 'title');
  const startDate = requiredString(req.body.startDate, 'startDate');
  const endDate = requiredString(req.body.endDate, 'endDate');

  const result = await query(
    `
      INSERT INTO trips (
        owner_id,
        title,
        description,
        start_date,
        end_date,
        cover_photo_url,
        base_currency,
        total_budget,
        visibility,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'planned')
      RETURNING id
    `,
    [
      ownerId,
      title,
      optionalString(req.body.description),
      startDate,
      endDate,
      optionalString(req.body.coverPhotoUrl),
      optionalString(req.body.baseCurrency) || 'USD',
      optionalNumber(req.body.totalBudget, 0),
      optionalString(req.body.visibility) || 'private'
    ]
  );

  const trip = await requireTrip(result.rows[0].id);
  res.status(201).json({ trip });
}));

router.get('/:tripId', asyncHandler(async (req, res) => {
  const trip = await requireTrip(req.params.tripId);

  const [stopsResult, activitiesResult] = await Promise.all([
    query(
      `
        SELECT
          ts.id,
          ts.trip_id AS "tripId",
          ts.city_id AS "cityId",
          c.name AS "cityName",
          c.country,
          c.region,
          c.image_url AS "imageUrl",
          ts.stop_order AS "stopOrder",
          ts.arrival_date AS "arrivalDate",
          ts.departure_date AS "departureDate",
          ts.lodging_name AS "lodgingName",
          ts.lodging_address AS "lodgingAddress",
          ts.notes
        FROM trip_stops ts
        JOIN cities c ON c.id = ts.city_id
        WHERE ts.trip_id = $1
        ORDER BY ts.stop_order ASC
      `,
      [req.params.tripId]
    ),
    query(
      `
        SELECT
          ta.id,
          ta.trip_id AS "tripId",
          ta.stop_id AS "stopId",
          ta.activity_id AS "activityId",
          ta.title,
          ta.description,
          ta.scheduled_date AS "scheduledDate",
          ta.start_time AS "startTime",
          ta.end_time AS "endTime",
          ta.cost,
          ta.currency,
          ta.notes
        FROM trip_activities ta
        WHERE ta.trip_id = $1
        ORDER BY ta.scheduled_date ASC, ta.start_time ASC NULLS LAST, ta.created_at ASC
      `,
      [req.params.tripId]
    )
  ]);

  res.json({
    trip: {
      ...trip,
      stops: stopsResult.rows,
      activities: activitiesResult.rows
    }
  });
}));

router.patch('/:tripId', asyncHandler(async (req, res) => {
  const fieldMap = {
    title: 'title',
    description: 'description',
    startDate: 'start_date',
    endDate: 'end_date',
    coverPhotoUrl: 'cover_photo_url',
    baseCurrency: 'base_currency',
    totalBudget: 'total_budget',
    visibility: 'visibility',
    status: 'status'
  };

  const assignments = [];
  const values = [];

  for (const [bodyKey, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      const value = bodyKey === 'totalBudget'
        ? optionalNumber(req.body[bodyKey], 0)
        : optionalString(req.body[bodyKey]);

      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    res.json({ trip: await requireTrip(req.params.tripId) });
    return;
  }

  values.push(req.params.tripId);

  const result = await query(
    `
      UPDATE trips
      SET ${assignments.join(', ')}, updated_at = now()
      WHERE id = $${values.length}
      RETURNING id
    `,
    values
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Trip not found');
  }

  res.json({ trip: await requireTrip(req.params.tripId) });
}));

router.post('/:tripId/stops', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const cityId = requiredString(req.body.cityId, 'cityId');
  const arrivalDate = requiredString(req.body.arrivalDate, 'arrivalDate');
  const departureDate = requiredString(req.body.departureDate, 'departureDate');

  const result = await query(
    `
      INSERT INTO trip_stops (
        trip_id,
        city_id,
        stop_order,
        arrival_date,
        departure_date,
        lodging_name,
        lodging_address,
        notes
      )
      VALUES (
        $1,
        $2,
        COALESCE((SELECT MAX(stop_order) + 1 FROM trip_stops WHERE trip_id = $1), 1),
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING
        id,
        trip_id AS "tripId",
        city_id AS "cityId",
        stop_order AS "stopOrder",
        arrival_date AS "arrivalDate",
        departure_date AS "departureDate",
        lodging_name AS "lodgingName",
        lodging_address AS "lodgingAddress",
        notes
    `,
    [
      req.params.tripId,
      cityId,
      arrivalDate,
      departureDate,
      optionalString(req.body.lodgingName),
      optionalString(req.body.lodgingAddress),
      optionalString(req.body.notes)
    ]
  );

  res.status(201).json({ stop: result.rows[0] });
}));

router.post('/:tripId/activities', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const stopId = requiredString(req.body.stopId, 'stopId');
  const scheduledDate = requiredString(req.body.scheduledDate, 'scheduledDate');
  let title = optionalString(req.body.title);
  let description = optionalString(req.body.description);
  let cost = optionalNumber(req.body.cost, 0);
  let currency = optionalString(req.body.currency) || 'USD';

  if (req.body.activityId && !title) {
    const activityResult = await query(
      `
        SELECT name, description, estimated_cost AS "estimatedCost", currency
        FROM activities
        WHERE id = $1
      `,
      [req.body.activityId]
    );
    const activity = activityResult.rows[0];

    if (activity) {
      title = activity.name;
      description = description || activity.description;
      cost = cost || activity.estimatedCost;
      currency = currency || activity.currency;
    }
  }

  if (!title) {
    throw createHttpError(400, 'title is required');
  }

  const result = await query(
    `
      INSERT INTO trip_activities (
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        id,
        trip_id AS "tripId",
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
    `,
    [
      req.params.tripId,
      stopId,
      optionalString(req.body.activityId),
      title,
      description,
      scheduledDate,
      optionalString(req.body.startTime),
      optionalString(req.body.endTime),
      cost,
      currency,
      optionalString(req.body.notes)
    ]
  );

  res.status(201).json({ activity: result.rows[0] });
}));

router.get('/:tripId/sections', asyncHandler(async (req, res) => {
  await ensureTripSectionsTable();
  await requireTrip(req.params.tripId);

  const result = await query(
    `
      SELECT ${sectionFields}
      FROM trip_sections
      WHERE trip_id = $1
      ORDER BY section_order ASC, created_at ASC
    `,
    [req.params.tripId]
  );

  res.json({ sections: result.rows });
}));

router.post('/:tripId/sections', asyncHandler(async (req, res) => {
  await ensureTripSectionsTable();
  await requireTrip(req.params.tripId);

  const title = requiredString(req.body.title, 'title');

  const result = await query(
    `
      INSERT INTO trip_sections (
        trip_id,
        section_type,
        title,
        description,
        start_date,
        end_date,
        budget_amount,
        currency,
        section_order
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
        COALESCE((SELECT MAX(section_order) + 1 FROM trip_sections WHERE trip_id = $1), 1)
      )
      RETURNING ${sectionFields}
    `,
    [
      req.params.tripId,
      optionalString(req.body.sectionType) || 'activity',
      title,
      optionalString(req.body.description),
      optionalString(req.body.startDate),
      optionalString(req.body.endDate),
      optionalNumber(req.body.budgetAmount, 0),
      optionalString(req.body.currency) || 'USD'
    ]
  );

  res.status(201).json({ section: result.rows[0] });
}));

router.patch('/:tripId/sections/:sectionId', asyncHandler(async (req, res) => {
  await ensureTripSectionsTable();
  await requireTrip(req.params.tripId);

  const fieldMap = {
    sectionType: 'section_type',
    title: 'title',
    description: 'description',
    startDate: 'start_date',
    endDate: 'end_date',
    budgetAmount: 'budget_amount',
    currency: 'currency',
    displayOrder: 'section_order'
  };

  const assignments = [];
  const values = [];

  for (const [bodyKey, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      const value = ['budgetAmount', 'displayOrder'].includes(bodyKey)
        ? optionalNumber(req.body[bodyKey], bodyKey === 'displayOrder' ? 1 : 0)
        : optionalString(req.body[bodyKey]);

      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    const section = await query(
      `SELECT ${sectionFields} FROM trip_sections WHERE trip_id = $1 AND id = $2`,
      [req.params.tripId, req.params.sectionId]
    );
    res.json({ section: section.rows[0] || null });
    return;
  }

  values.push(req.params.tripId, req.params.sectionId);

  const result = await query(
    `
      UPDATE trip_sections
      SET ${assignments.join(', ')}, updated_at = now()
      WHERE trip_id = $${values.length - 1} AND id = $${values.length}
      RETURNING ${sectionFields}
    `,
    values
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Section not found');
  }

  res.json({ section: result.rows[0] });
}));

router.delete('/:tripId/sections/:sectionId', asyncHandler(async (req, res) => {
  await ensureTripSectionsTable();

  const result = await query(
    'DELETE FROM trip_sections WHERE trip_id = $1 AND id = $2',
    [req.params.tripId, req.params.sectionId]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Section not found');
  }

  res.status(204).send();
}));

router.get('/:tripId/budget', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const [summaryResult, breakdownResult] = await Promise.all([
    query(
      `
        SELECT
          trip_id AS "tripId",
          title,
          total_budget AS "totalBudget",
          estimated_total AS "estimatedTotal",
          actual_total AS "actualTotal",
          estimated_remaining AS "estimatedRemaining",
          is_over_estimated_budget AS "isOverEstimatedBudget"
        FROM trip_budget_summary
        WHERE trip_id = $1
      `,
      [req.params.tripId]
    ),
    query(
      `
        SELECT
          category,
          estimated_total AS "estimatedTotal",
          actual_total AS "actualTotal"
        FROM trip_expense_breakdown
        WHERE trip_id = $1
        ORDER BY category ASC
      `,
      [req.params.tripId]
    )
  ]);

  res.json({
    budget: summaryResult.rows[0] || null,
    breakdown: breakdownResult.rows
  });
}));

router.post('/:tripId/expenses', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const result = await query(
    `
      INSERT INTO trip_expenses (
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
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
    `,
    [
      req.params.tripId,
      optionalString(req.body.stopId),
      optionalString(req.body.category) || 'other',
      requiredString(req.body.label, 'label'),
      optionalNumber(req.body.estimatedAmount, 0),
      req.body.actualAmount === undefined ? null : optionalNumber(req.body.actualAmount, 0),
      optionalString(req.body.currency) || 'USD',
      optionalString(req.body.expenseDate),
      optionalString(req.body.notes)
    ]
  );

  res.status(201).json({ expense: result.rows[0] });
}));

router.get('/:tripId/packing-items', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const result = await query(
    `
      SELECT
        id,
        trip_id AS "tripId",
        item_name AS "itemName",
        category,
        quantity,
        is_packed AS "isPacked",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM packing_items
      WHERE trip_id = $1
      ORDER BY category ASC, created_at ASC
    `,
    [req.params.tripId]
  );

  res.json({ items: result.rows });
}));

router.post('/:tripId/packing-items', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const result = await query(
    `
      INSERT INTO packing_items (trip_id, item_name, category, quantity, is_packed)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        trip_id AS "tripId",
        item_name AS "itemName",
        category,
        quantity,
        is_packed AS "isPacked",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      req.params.tripId,
      requiredString(req.body.itemName, 'itemName'),
      optionalString(req.body.category) || 'other',
      optionalNumber(req.body.quantity, 1),
      Boolean(req.body.isPacked)
    ]
  );

  res.status(201).json({ item: result.rows[0] });
}));

router.patch('/:tripId/packing-items/:itemId', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const fieldMap = {
    itemName: 'item_name',
    category: 'category',
    quantity: 'quantity',
    isPacked: 'is_packed'
  };
  const assignments = [];
  const values = [];

  for (const [bodyKey, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      const value = bodyKey === 'quantity'
        ? optionalNumber(req.body[bodyKey], 1)
        : bodyKey === 'isPacked'
          ? Boolean(req.body[bodyKey])
          : optionalString(req.body[bodyKey]);

      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    throw createHttpError(400, 'No packing item fields provided');
  }

  values.push(req.params.tripId, req.params.itemId);

  const result = await query(
    `
      UPDATE packing_items
      SET ${assignments.join(', ')}, updated_at = now()
      WHERE trip_id = $${values.length - 1} AND id = $${values.length}
      RETURNING
        id,
        trip_id AS "tripId",
        item_name AS "itemName",
        category,
        quantity,
        is_packed AS "isPacked",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Packing item not found');
  }

  res.json({ item: result.rows[0] });
}));

router.delete('/:tripId/packing-items/:itemId', asyncHandler(async (req, res) => {
  const result = await query(
    'DELETE FROM packing_items WHERE trip_id = $1 AND id = $2',
    [req.params.tripId, req.params.itemId]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Packing item not found');
  }

  res.status(204).send();
}));

router.get('/:tripId/notes', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const result = await query(
    `
      SELECT
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
      ORDER BY COALESCE(note_date, created_at::date) DESC, created_at DESC
    `,
    [req.params.tripId]
  );

  res.json({ notes: result.rows });
}));

router.post('/:tripId/notes', asyncHandler(async (req, res) => {
  await requireTrip(req.params.tripId);

  const result = await query(
    `
      INSERT INTO trip_notes (trip_id, stop_id, created_by, note_date, title, body)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        trip_id AS "tripId",
        stop_id AS "stopId",
        created_by AS "createdBy",
        note_date AS "noteDate",
        title,
        body,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      req.params.tripId,
      optionalString(req.body.stopId),
      optionalString(req.body.createdBy),
      optionalString(req.body.noteDate),
      optionalString(req.body.title),
      requiredString(req.body.body, 'body')
    ]
  );

  res.status(201).json({ note: result.rows[0] });
}));

module.exports = router;
