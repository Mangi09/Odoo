const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();
const toNull = (value) => (value === undefined || value === '' ? null : value);

router.get('/:activityId/reviews', asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  const summaryResult = await query(
    `SELECT
       activity_id AS "activityId",
       activity_name AS "activityName",
       city_id AS "cityId",
       review_count AS "reviewCount",
       average_rating AS "averageRating"
     FROM activity_review_summary
     WHERE activity_id = $1`,
    [activityId]
  );

  const reviewsResult = await query(
    `SELECT
       r.id,
       r.activity_id AS "activityId",
       r.user_id AS "userId",
       u.full_name AS "userName",
       u.avatar_url AS "userAvatarUrl",
       r.rating,
       r.review_text AS "reviewText",
       r.created_at AS "createdAt",
       r.updated_at AS "updatedAt"
     FROM activity_reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.activity_id = $1
     ORDER BY r.created_at DESC`,
    [activityId]
  );

  res.json({
    summary: summaryResult.rows[0] || null,
    reviews: reviewsResult.rows
  });
}));

router.post('/:activityId/reviews', asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const { userId, rating, reviewText } = req.body;

  if (!userId || !rating) {
    throw createHttpError(400, 'userId and rating are required');
  }

  const result = await query(
    `INSERT INTO activity_reviews (activity_id, user_id, rating, review_text)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (activity_id, user_id) DO UPDATE
     SET
       rating = EXCLUDED.rating,
       review_text = EXCLUDED.review_text
     RETURNING
       id,
       activity_id AS "activityId",
       user_id AS "userId",
       rating,
       review_text AS "reviewText",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [activityId, userId, rating, toNull(reviewText)]
  );

  res.status(201).json({ review: result.rows[0] });
}));

router.delete('/:activityId/reviews/:reviewId', asyncHandler(async (req, res) => {
  const { activityId, reviewId } = req.params;

  const result = await query(
    `DELETE FROM activity_reviews
     WHERE activity_id = $1 AND id = $2
     RETURNING id`,
    [activityId, reviewId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Activity review not found');
  }

  res.status(204).send();
}));

module.exports = router;
