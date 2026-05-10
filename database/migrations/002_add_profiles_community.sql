-- Traveloop optional feature tables
-- Run this after database/migrations/schema_structure.sql:
-- psql -U postgres -d traveloop -f database/migrations/002_add_profiles_community.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS username CITEXT,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(80),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(80),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30),
ADD COLUMN IF NOT EXISTS city VARCHAR(120),
ADD COLUMN IF NOT EXISTS country VARCHAR(120),
ADD COLUMN IF NOT EXISTS additional_info TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username
ON users(username)
WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    title VARCHAR(160) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'friends', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS activity_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_activity_reviews_activity_user UNIQUE (activity_id, user_id)
);

-- Optional flexible itinerary sections for the PDF's "Section 1 / Section 2" idea.
-- The existing trip_stops and trip_activities tables already cover itinerary building,
-- but this table lets the UI store custom sections such as travel, hotel, or notes.
CREATE TABLE IF NOT EXISTS trip_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id UUID,
    section_order INTEGER NOT NULL CHECK (section_order > 0),
    section_type VARCHAR(30) NOT NULL DEFAULT 'other'
        CHECK (section_type IN ('travel', 'hotel', 'activity', 'note', 'other')),
    title VARCHAR(160) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget_amount NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (budget_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_trip_sections_stop
        FOREIGN KEY (trip_id, stop_id)
        REFERENCES trip_stops(trip_id, id)
        ON DELETE CASCADE,
    CONSTRAINT ck_trip_sections_date_range
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT uq_trip_sections_order UNIQUE (trip_id, section_order)
);

CREATE INDEX IF NOT EXISTS idx_users_profile_location ON users(country, city);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_trip ON community_posts(trip_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_activity ON community_posts(activity_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_activity ON activity_reviews(activity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_sections_trip_order ON trip_sections(trip_id, section_order);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_posts_updated_at ON community_posts;
CREATE TRIGGER trg_community_posts_updated_at
BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_community_comments_updated_at ON community_comments;
CREATE TRIGGER trg_community_comments_updated_at
BEFORE UPDATE ON community_comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_activity_reviews_updated_at ON activity_reviews;
CREATE TRIGGER trg_activity_reviews_updated_at
BEFORE UPDATE ON activity_reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trip_sections_updated_at ON trip_sections;
CREATE TRIGGER trg_trip_sections_updated_at
BEFORE UPDATE ON trip_sections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE VIEW community_post_stats AS
SELECT
    p.id AS post_id,
    p.title,
    p.user_id,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT l.user_id) AS like_count
FROM community_posts p
LEFT JOIN community_comments c ON c.post_id = p.id
LEFT JOIN community_likes l ON l.post_id = p.id
GROUP BY p.id, p.title, p.user_id;

CREATE OR REPLACE VIEW activity_review_summary AS
SELECT
    a.id AS activity_id,
    a.name AS activity_name,
    a.city_id,
    COUNT(r.id) AS review_count,
    ROUND(AVG(r.rating)::numeric, 2) AS average_rating
FROM activities a
LEFT JOIN activity_reviews r ON r.activity_id = a.id
GROUP BY a.id, a.name, a.city_id;
