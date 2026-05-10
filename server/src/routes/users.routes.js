const express = require('express');
const { query } = require('../db/pool');
const { ensureUserProfileColumns } = require('../db/bootstrap');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { optionalString } = require('../utils/request');

const router = express.Router();

const userFields = `
  id,
  full_name AS "fullName",
  email,
  avatar_url AS "avatarUrl",
  language_code AS "languageCode",
  role,
  username,
  phone_number AS "phoneNumber",
  city,
  country,
  additional_info AS "additionalInfo",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const getUser = async (userId) => {
  await ensureUserProfileColumns();

  const result = await query(
    `SELECT ${userFields} FROM users WHERE id = $1`,
    [userId]
  );

  return result.rows[0];
};

router.get('/:userId', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.json({ user });
}));

router.patch('/:userId', asyncHandler(async (req, res) => {
  await ensureUserProfileColumns();

  const fieldMap = {
    fullName: 'full_name',
    avatarUrl: 'avatar_url',
    languageCode: 'language_code',
    username: 'username',
    phoneNumber: 'phone_number',
    city: 'city',
    country: 'country',
    additionalInfo: 'additional_info'
  };

  const assignments = [];
  const values = [];

  for (const [bodyKey, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      values.push(optionalString(req.body[bodyKey]));
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    const user = await getUser(req.params.userId);
    res.json({ user });
    return;
  }

  values.push(req.params.userId);

  const result = await query(
    `
      UPDATE users
      SET ${assignments.join(', ')}, updated_at = now()
      WHERE id = $${values.length}
      RETURNING ${userFields}
    `,
    values
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'User not found');
  }

  res.json({ user: result.rows[0] });
}));

router.get('/:userId/saved-cities', asyncHandler(async (req, res) => {
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
        sc.created_at AS "savedAt"
      FROM saved_cities sc
      JOIN cities c ON c.id = sc.city_id
      WHERE sc.user_id = $1
      ORDER BY sc.created_at DESC
    `,
    [req.params.userId]
  );

  res.json({ cities: result.rows });
}));

router.post('/:userId/saved-cities', asyncHandler(async (req, res) => {
  if (!req.body.cityId) {
    throw createHttpError(400, 'cityId is required');
  }

  await query(
    `
      INSERT INTO saved_cities (user_id, city_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, city_id) DO NOTHING
    `,
    [req.params.userId, req.body.cityId]
  );

  const cityResult = await query(
    `
      SELECT
        id,
        name,
        country,
        region,
        cost_index AS "costIndex",
        popularity_score AS "popularityScore",
        image_url AS "imageUrl"
      FROM cities
      WHERE id = $1
    `,
    [req.body.cityId]
  );

  if (cityResult.rowCount === 0) {
    throw createHttpError(404, 'City not found');
  }

  res.status(201).json({ city: cityResult.rows[0] });
}));

router.delete('/:userId/saved-cities/:cityId', asyncHandler(async (req, res) => {
  await query(
    'DELETE FROM saved_cities WHERE user_id = $1 AND city_id = $2',
    [req.params.userId, req.params.cityId]
  );

  res.status(204).send();
}));

module.exports = router;
