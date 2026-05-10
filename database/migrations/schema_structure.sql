-- Traveloop PostgreSQL schema
-- Run with:
-- psql -U postgres -d traveloop -f database/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    role VARCHAR(20) NOT NULL DEFAULT 'traveler'
        CHECK (role IN ('traveler', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    country VARCHAR(120) NOT NULL,
    region VARCHAR(120),
    cost_index NUMERIC(4, 2) NOT NULL DEFAULT 3.00
        CHECK (cost_index >= 1 AND cost_index <= 5),
    popularity_score INTEGER NOT NULL DEFAULT 0
        CHECK (popularity_score >= 0 AND popularity_score <= 100),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cities_name_country UNIQUE (name, country)
);

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(40) NOT NULL
        CHECK (category IN (
            'sightseeing',
            'food',
            'adventure',
            'culture',
            'shopping',
            'nature',
            'nightlife',
            'other'
        )),
    description TEXT,
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (estimated_cost >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_photo_url TEXT,
    base_currency CHAR(3) NOT NULL DEFAULT 'USD',
    total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (total_budget >= 0),
    visibility VARCHAR(20) NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'friends', 'public')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'planned', 'completed', 'cancelled')),
    share_slug TEXT NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_trips_date_range CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS trip_collaborators (
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) NOT NULL DEFAULT 'view'
        CHECK (permission IN ('view', 'edit')),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (trip_id, user_id)
);

CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    stop_order INTEGER NOT NULL CHECK (stop_order > 0),
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    lodging_name VARCHAR(160),
    lodging_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_trip_stops_date_range CHECK (departure_date >= arrival_date),
    CONSTRAINT uq_trip_stops_order UNIQUE (trip_id, stop_order),
    CONSTRAINT uq_trip_stops_trip_id_id UNIQUE (trip_id, id)
);

CREATE TABLE IF NOT EXISTS trip_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    stop_id UUID NOT NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_trip_activities_stop
        FOREIGN KEY (trip_id, stop_id)
        REFERENCES trip_stops(trip_id, id)
        ON DELETE CASCADE,
    CONSTRAINT ck_trip_activities_time_range
        CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE TABLE IF NOT EXISTS trip_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id UUID,
    category VARCHAR(40) NOT NULL
        CHECK (category IN ('transport', 'stay', 'activities', 'meals', 'shopping', 'other')),
    label VARCHAR(160) NOT NULL,
    estimated_amount NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (estimated_amount >= 0),
    actual_amount NUMERIC(10, 2)
        CHECK (actual_amount IS NULL OR actual_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    expense_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_trip_expenses_stop
        FOREIGN KEY (trip_id, stop_id)
        REFERENCES trip_stops(trip_id, id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS packing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    item_name VARCHAR(140) NOT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'other'
        CHECK (category IN ('clothing', 'documents', 'electronics', 'medicine', 'toiletries', 'other')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    is_packed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id UUID,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    note_date DATE,
    title VARCHAR(160),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_trip_notes_stop
        FOREIGN KEY (trip_id, stop_id)
        REFERENCES trip_stops(trip_id, id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_cities (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, city_id)
);

CREATE TABLE IF NOT EXISTS trip_copies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    copied_trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    copied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_trip_copies_copied_trip UNIQUE (copied_trip_id)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cities_search ON cities(country, region, name);
CREATE INDEX IF NOT EXISTS idx_activities_city_category ON activities(city_id, category);
CREATE INDEX IF NOT EXISTS idx_trips_owner_dates ON trips(owner_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trips_visibility ON trips(visibility);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_order ON trip_stops(trip_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_date ON trip_activities(stop_id, scheduled_date, start_time);
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip_category ON trip_expenses(trip_id, category);
CREATE INDEX IF NOT EXISTS idx_packing_items_trip ON packing_items(trip_id, is_packed);
CREATE INDEX IF NOT EXISTS idx_trip_notes_trip_date ON trip_notes(trip_id, note_date);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cities_updated_at ON cities;
CREATE TRIGGER trg_cities_updated_at
BEFORE UPDATE ON cities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON activities;
CREATE TRIGGER trg_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trips_updated_at ON trips;
CREATE TRIGGER trg_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trip_stops_updated_at ON trip_stops;
CREATE TRIGGER trg_trip_stops_updated_at
BEFORE UPDATE ON trip_stops
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trip_activities_updated_at ON trip_activities;
CREATE TRIGGER trg_trip_activities_updated_at
BEFORE UPDATE ON trip_activities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trip_expenses_updated_at ON trip_expenses;
CREATE TRIGGER trg_trip_expenses_updated_at
BEFORE UPDATE ON trip_expenses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_packing_items_updated_at ON packing_items;
CREATE TRIGGER trg_packing_items_updated_at
BEFORE UPDATE ON packing_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trip_notes_updated_at ON trip_notes;
CREATE TRIGGER trg_trip_notes_updated_at
BEFORE UPDATE ON trip_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE VIEW trip_expense_breakdown AS
SELECT
    trip_id,
    category,
    SUM(estimated_amount) AS estimated_total,
    SUM(COALESCE(actual_amount, 0)) AS actual_total
FROM trip_expenses
GROUP BY trip_id, category;

CREATE OR REPLACE VIEW trip_budget_summary AS
SELECT
    t.id AS trip_id,
    t.title,
    t.total_budget,
    COALESCE(SUM(e.estimated_amount), 0) AS estimated_total,
    COALESCE(SUM(COALESCE(e.actual_amount, 0)), 0) AS actual_total,
    t.total_budget - COALESCE(SUM(e.estimated_amount), 0) AS estimated_remaining,
    COALESCE(SUM(e.estimated_amount), 0) > t.total_budget AS is_over_estimated_budget
FROM trips t
LEFT JOIN trip_expenses e ON e.trip_id = t.id
GROUP BY t.id, t.title, t.total_budget;

CREATE OR REPLACE VIEW popular_cities AS
SELECT
    c.id AS city_id,
    c.name,
    c.country,
    COUNT(ts.id) AS times_added_to_trips
FROM cities c
LEFT JOIN trip_stops ts ON ts.city_id = c.id
GROUP BY c.id, c.name, c.country
ORDER BY times_added_to_trips DESC, c.name ASC;
