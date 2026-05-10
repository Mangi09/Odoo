const express = require('express');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');

const router = express.Router();
const toNull = (value) => (value === undefined || value === '' ? null : value);

router.get('/posts', asyncHandler(async (req, res) => {
  const search = req.query.search || '';
  const userId = req.query.userId || null;
  const tripId = req.query.tripId || null;
  const activityId = req.query.activityId || null;

  const result = await query(
    `SELECT
       p.id,
       p.user_id AS "userId",
       u.full_name AS "userName",
       u.avatar_url AS "userAvatarUrl",
       p.trip_id AS "tripId",
       p.activity_id AS "activityId",
       p.title,
       p.content,
       p.image_url AS "imageUrl",
       p.visibility,
       COALESCE(s.comment_count, 0)::int AS "commentCount",
       COALESCE(s.like_count, 0)::int AS "likeCount",
       p.created_at AS "createdAt",
       p.updated_at AS "updatedAt"
     FROM community_posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN community_post_stats s ON s.post_id = p.id
     WHERE
       p.visibility = 'public'
       AND ($1::text = '' OR p.title ILIKE '%' || $1 || '%' OR p.content ILIKE '%' || $1 || '%')
       AND ($2::uuid IS NULL OR p.user_id = $2)
       AND ($3::uuid IS NULL OR p.trip_id = $3)
       AND ($4::uuid IS NULL OR p.activity_id = $4)
     ORDER BY p.created_at DESC
     LIMIT 50`,
    [search, userId, tripId, activityId]
  );

  res.json({ posts: result.rows });
}));

router.post('/posts', asyncHandler(async (req, res) => {
  const { userId, tripId, activityId, title, content, imageUrl, visibility } = req.body;

  if (!userId || !title || !content) {
    throw createHttpError(400, 'userId, title, and content are required');
  }

  const result = await query(
    `INSERT INTO community_posts (
       user_id,
       trip_id,
       activity_id,
       title,
       content,
       image_url,
       visibility
     )
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'public'))
     RETURNING
       id,
       user_id AS "userId",
       trip_id AS "tripId",
       activity_id AS "activityId",
       title,
       content,
       image_url AS "imageUrl",
       visibility,
       created_at AS "createdAt"`,
    [userId, toNull(tripId), toNull(activityId), title, content, toNull(imageUrl), toNull(visibility)]
  );

  res.status(201).json({ post: result.rows[0] });
}));

router.get('/posts/:postId', asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const postResult = await query(
    `SELECT
       p.id,
       p.user_id AS "userId",
       u.full_name AS "userName",
       u.avatar_url AS "userAvatarUrl",
       p.trip_id AS "tripId",
       p.activity_id AS "activityId",
       p.title,
       p.content,
       p.image_url AS "imageUrl",
       p.visibility,
       COALESCE(s.comment_count, 0)::int AS "commentCount",
       COALESCE(s.like_count, 0)::int AS "likeCount",
       p.created_at AS "createdAt",
       p.updated_at AS "updatedAt"
     FROM community_posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN community_post_stats s ON s.post_id = p.id
     WHERE p.id = $1`,
    [postId]
  );

  if (!postResult.rows[0]) {
    throw createHttpError(404, 'Community post not found');
  }

  const commentsResult = await query(
    `SELECT
       c.id,
       c.post_id AS "postId",
       c.user_id AS "userId",
       u.full_name AS "userName",
       u.avatar_url AS "userAvatarUrl",
       c.comment_text AS "commentText",
       c.created_at AS "createdAt",
       c.updated_at AS "updatedAt"
     FROM community_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );

  res.json({
    post: postResult.rows[0],
    comments: commentsResult.rows
  });
}));

router.patch('/posts/:postId', asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, content, imageUrl, visibility } = req.body;

  const result = await query(
    `UPDATE community_posts
     SET
       title = COALESCE($2, title),
       content = COALESCE($3, content),
       image_url = COALESCE($4, image_url),
       visibility = COALESCE($5, visibility)
     WHERE id = $1
     RETURNING
       id,
       user_id AS "userId",
       trip_id AS "tripId",
       activity_id AS "activityId",
       title,
       content,
       image_url AS "imageUrl",
       visibility,
       updated_at AS "updatedAt"`,
    [postId, toNull(title), toNull(content), toNull(imageUrl), toNull(visibility)]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Community post not found');
  }

  res.json({ post: result.rows[0] });
}));

router.delete('/posts/:postId', asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const result = await query(
    `DELETE FROM community_posts
     WHERE id = $1
     RETURNING id`,
    [postId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Community post not found');
  }

  res.status(204).send();
}));

router.post('/posts/:postId/comments', asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId, commentText } = req.body;

  if (!userId || !commentText) {
    throw createHttpError(400, 'userId and commentText are required');
  }

  const result = await query(
    `INSERT INTO community_comments (post_id, user_id, comment_text)
     VALUES ($1, $2, $3)
     RETURNING
       id,
       post_id AS "postId",
       user_id AS "userId",
       comment_text AS "commentText",
       created_at AS "createdAt"`,
    [postId, userId, commentText]
  );

  res.status(201).json({ comment: result.rows[0] });
}));

router.delete('/posts/:postId/comments/:commentId', asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const result = await query(
    `DELETE FROM community_comments
     WHERE post_id = $1 AND id = $2
     RETURNING id`,
    [postId, commentId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Community comment not found');
  }

  res.status(204).send();
}));

router.post('/posts/:postId/likes', asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw createHttpError(400, 'userId is required');
  }

  await query(
    `INSERT INTO community_likes (post_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING`,
    [postId, userId]
  );

  res.status(201).json({ liked: true });
}));

router.delete('/posts/:postId/likes/:userId', asyncHandler(async (req, res) => {
  const { postId, userId } = req.params;

  const result = await query(
    `DELETE FROM community_likes
     WHERE post_id = $1 AND user_id = $2
     RETURNING post_id`,
    [postId, userId]
  );

  if (!result.rows[0]) {
    throw createHttpError(404, 'Community like not found');
  }

  res.status(204).send();
}));

module.exports = router;
