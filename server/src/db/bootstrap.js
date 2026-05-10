const { query } = require('./pool');

let userProfileColumnsReady = false;
let tripSectionsReady = false;

const ensureUserProfileColumns = async () => {
  if (userProfileColumnsReady) {
    return;
  }

  await query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(80),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(40),
      ADD COLUMN IF NOT EXISTS city VARCHAR(120),
      ADD COLUMN IF NOT EXISTS country VARCHAR(120),
      ADD COLUMN IF NOT EXISTS additional_info TEXT
  `);

  userProfileColumnsReady = true;
};

const ensureTripSectionsTable = async () => {
  if (tripSectionsReady) {
    return;
  }

  await query(`
    CREATE TABLE IF NOT EXISTS trip_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      section_type VARCHAR(30) NOT NULL DEFAULT 'activity'
        CHECK (section_type IN ('travel', 'hotel', 'activity', 'note', 'other')),
      title VARCHAR(160) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      budget_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (budget_amount >= 0),
      currency CHAR(3) NOT NULL DEFAULT 'USD',
      section_order INTEGER NOT NULL DEFAULT 1 CHECK (section_order > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT ck_trip_sections_date_range CHECK (
        end_date IS NULL OR start_date IS NULL OR end_date >= start_date
      ),
      CONSTRAINT uq_trip_sections_order UNIQUE (trip_id, section_order)
    );

    CREATE INDEX IF NOT EXISTS idx_trip_sections_trip_order
      ON trip_sections(trip_id, section_order);
  `);

  await query(`
    ALTER TABLE trip_sections
      ADD COLUMN IF NOT EXISTS section_order INTEGER;

    UPDATE trip_sections
    SET section_order = 1
    WHERE section_order IS NULL;

    ALTER TABLE trip_sections
      ALTER COLUMN section_order SET DEFAULT 1;
  `);

  tripSectionsReady = true;
};

module.exports = {
  ensureTripSectionsTable,
  ensureUserProfileColumns
};
