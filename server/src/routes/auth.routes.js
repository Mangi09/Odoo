const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { hashPassword, verifyPassword } = require('../utils/password');

const router = express.Router();

router.post('/signup', asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw createHttpError(400, 'fullName, email, and password are required');
  }

  const result = await query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING
       id,
       full_name AS "fullName",
       email,
       role,
       avatar_url AS "avatarUrl",
       language_code AS "languageCode",
       created_at AS "createdAt"`,
    [fullName, email, hashPassword(password)]
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
       email,
       password_hash AS "passwordHash",
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
