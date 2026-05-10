-- Demo itinerary sections for Screen 5.
-- Run after migrations/002_add_profiles_community.sql:
-- psql -U postgres -d traveloop -f database/seeds/demo_sections.sql

INSERT INTO trip_sections (
    id,
    trip_id,
    section_order,
    section_type,
    title,
    description,
    start_date,
    end_date,
    budget_amount,
    currency
)
VALUES
    (
        '90000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        1,
        'travel',
        'Tokyo arrival and hotel check-in',
        'Land in Tokyo, take airport transfer, and settle into the hotel before an evening walk.',
        '2026-04-03',
        '2026-04-03',
        180.00,
        'USD'
    ),
    (
        '90000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        2,
        'activity',
        'Shibuya and food walk',
        'Explore Shibuya crossing, nearby streets, and local snacks during the evening.',
        '2026-04-04',
        '2026-04-04',
        45.00,
        'USD'
    ),
    (
        '90000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        3,
        'hotel',
        'Kyoto garden stay',
        'Check into the Kyoto hotel and keep temple visit notes for the next morning.',
        '2026-04-06',
        '2026-04-09',
        360.00,
        'USD'
    )
ON CONFLICT (id) DO UPDATE
SET
    section_type = EXCLUDED.section_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    budget_amount = EXCLUDED.budget_amount,
    currency = EXCLUDED.currency;
