const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();
const toNull = (value) => (value === undefined || value === '' ? null : value);

router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await query(
    `SELECT
       id,
       full_name AS "fullName",
       first_name AS "firstName",
       last_name AS "lastName",
       username,
       email,
       phone_number AS "phoneNumber",
       city,
       country,
       additional_info AS "additionalInfo",
       avatar_url AS "avatarUrl",
       language_code AS "languageCode",
       role,
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'User not found');
  }

  res.json({ user: result.rows[0] });
}));

router.patch('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    fullName,
    firstName,
    lastName,
    username,
    phoneNumber,
    city,
    country,
    additionalInfo,
    avatarUrl,
    languageCode
  } = req.body;

  const result = await query(
    `UPDATE users
     SET
       full_name = COALESCE($2, full_name),
       first_name = COALESCE($3, first_name),
       last_name = COALESCE($4, last_name),
       username = COALESCE($5, username),
       phone_number = COALESCE($6, phone_number),
       city = COALESCE($7, city),
       country = COALESCE($8, country),
       additional_info = COALESCE($9, additional_info),
       avatar_url = COALESCE($10, avatar_url),
       language_code = COALESCE($11, language_code)
     WHERE id = $1
     RETURNING
       id,
       full_name AS "fullName",
       first_name AS "firstName",
       last_name AS "lastName",
       username,
       email,
       phone_number AS "phoneNumber",
       city,
       country,
       additional_info AS "additionalInfo",
       avatar_url AS "avatarUrl",
       language_code AS "languageCode",
       role,
       updated_at AS "updatedAt"`,
    [
      userId,
      toNull(fullName),
      toNull(firstName),
      toNull(lastName),
      toNull(username),
      toNull(phoneNumber),
      toNull(city),
      toNull(country),
      toNull(additionalInfo),
      toNull(avatarUrl),
      toNull(languageCode)
    ]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'User not found');
  }

  res.json({ user: result.rows[0] });
}));

router.get('/:userId/saved-cities', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await query(
    `SELECT
       c.id,
       c.name,
       c.country,
       c.region,
       c.cost_index AS "costIndex",
       c.popularity_score AS "popularityScore",
       c.image_url AS "imageUrl",
       sc.created_at AS "savedAt"
     FROM saved_cities sc
     JOIN cities c ON c.id = sc.city_id
     WHERE sc.user_id = $1
     ORDER BY sc.created_at DESC`,
    [userId]
  );

  res.json({ cities: result.rows });
}));

router.post('/:userId/saved-cities', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { cityId } = req.body;

  if (!cityId) {
    throw createHttpError(400, 'cityId is required');
  }

  const result = await query(
    `INSERT INTO saved_cities (user_id, city_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, city_id) DO NOTHING
     RETURNING user_id AS "userId", city_id AS "cityId", created_at AS "createdAt"`,
    [userId, cityId]
  );

  res.status(201).json({
    savedCity: result.rows[0] || { userId, cityId }
  });
}));

router.delete('/:userId/saved-cities/:cityId', asyncHandler(async (req, res) => {
  const { userId, cityId } = req.params;

  const result = await query(
    `DELETE FROM saved_cities
     WHERE user_id = $1 AND city_id = $2
     RETURNING city_id`,
    [userId, cityId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Saved city not found');
  }

  res.status(204).send();
}));

module.exports = router;
