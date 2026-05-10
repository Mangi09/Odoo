const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { hashPassword, verifyPassword } = require('../utils/password');

const router = express.Router();

router.post('/signup', asyncHandler(async (req, res) => {
  const {
    fullName,
    firstName,
    lastName,
    username,
    email,
    password,
    phoneNumber,
    city,
    country,
    additionalInfo,
    avatarUrl
  } = req.body;

  const finalFullName = fullName || [firstName, lastName].filter(Boolean).join(' ');

  if (!finalFullName || !email || !password) {
    throw createHttpError(400, 'fullName or firstName, email, and password are required');
  }

  const result = await query(
    `INSERT INTO users (
       full_name,
       first_name,
       last_name,
       username,
       email,
       password_hash,
       phone_number,
       city,
       country,
       additional_info,
       avatar_url
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
       role,
       avatar_url AS "avatarUrl",
       language_code AS "languageCode",
       created_at AS "createdAt"`,
    [
      finalFullName,
      firstName || null,
      lastName || null,
      username || null,
      email,
      hashPassword(password),
      phoneNumber || null,
      city || null,
      country || null,
      additionalInfo || null,
      avatarUrl || null
    ]
  );

  res.status(201).json({ user: result.rows[0] });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createHttpError(400, 'email and password are required');
  }

  const result = await query(
    `SELECT
       id,
       full_name AS "fullName",
       first_name AS "firstName",
       last_name AS "lastName",
       username,
       email,
       password_hash AS "passwordHash",
       phone_number AS "phoneNumber",
       city,
       country,
       additional_info AS "additionalInfo",
       role,
       avatar_url AS "avatarUrl",
       language_code AS "languageCode"
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createHttpError(401, 'Invalid email or password');
  }

  delete user.passwordHash;

  res.json({ user });
}));

module.exports = router;
