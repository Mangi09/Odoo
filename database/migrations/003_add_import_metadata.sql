-- Traveloop import metadata for large city/country datasets and images.
-- Run after 002_add_profiles_community.sql:
-- psql -U postgres -d traveloop -f database/migrations/003_add_import_metadata.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS countries (
    code CHAR(2) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    region VARCHAR(120),
    subregion VARCHAR(120),
    capital VARCHAR(120),
    currency_code CHAR(3),
    phone_code VARCHAR(20),
    flag_url TEXT,
    image_url TEXT,
    image_source VARCHAR(80),
    image_credit TEXT,
    image_license VARCHAR(80),
    image_source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cities
ADD COLUMN IF NOT EXISTS geoname_id BIGINT,
ADD COLUMN IF NOT EXISTS country_code CHAR(2),
ADD COLUMN IF NOT EXISTS population BIGINT,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(80),
ADD COLUMN IF NOT EXISTS image_source VARCHAR(80),
ADD COLUMN IF NOT EXISTS image_credit TEXT,
ADD COLUMN IF NOT EXISTS image_license VARCHAR(80),
ADD COLUMN IF NOT EXISTS image_source_url TEXT;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS external_source VARCHAR(80),
ADD COLUMN IF NOT EXISTS external_id VARCHAR(120),
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6),
ADD COLUMN IF NOT EXISTS image_source VARCHAR(80),
ADD COLUMN IF NOT EXISTS image_credit TEXT,
ADD COLUMN IF NOT EXISTS image_license VARCHAR(80),
ADD COLUMN IF NOT EXISTS image_source_url TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_cities_country_code'
    ) THEN
        ALTER TABLE cities
        ADD CONSTRAINT fk_cities_country_code
        FOREIGN KEY (country_code)
        REFERENCES countries(code)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cities_geoname_id
ON cities(geoname_id)
WHERE geoname_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_activities_external_source_id
ON activities(external_source, external_id)
WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);
CREATE INDEX IF NOT EXISTS idx_cities_population ON cities(population DESC);
CREATE INDEX IF NOT EXISTS idx_activities_external_source ON activities(external_source);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_countries_updated_at ON countries;
CREATE TRIGGER trg_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
