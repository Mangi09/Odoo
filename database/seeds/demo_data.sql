-- Demo data for Traveloop
-- Run after 001_init.sql:
-- psql -U postgres -d traveloop -f database/seeds/001_demo_data.sql

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Aarav Sharma',
        'aarav@example.com',
        'replace-with-real-bcrypt-hash',
        'traveler'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Admin User',
        'admin@example.com',
        'replace-with-real-bcrypt-hash',
        'admin'
    )
ON CONFLICT (email) DO NOTHING;

INSERT INTO cities (
    id,
    name,
    country,
    region,
    cost_index,
    popularity_score,
    latitude,
    longitude,
    image_url
)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Tokyo',
        'Japan',
        'Kanto',
        4.20,
        96,
        35.676200,
        139.650300,
        'https://example.com/tokyo.jpg'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Kyoto',
        'Japan',
        'Kansai',
        3.70,
        91,
        35.011600,
        135.768100,
        'https://example.com/kyoto.jpg'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Osaka',
        'Japan',
        'Kansai',
        3.60,
        88,
        34.693700,
        135.502300,
        'https://example.com/osaka.jpg'
    )
ON CONFLICT (name, country) DO NOTHING;

INSERT INTO activities (
    id,
    city_id,
    name,
    category,
    description,
    estimated_cost,
    currency,
    duration_minutes
)
VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'Shibuya crossing and street food walk',
        'food',
        'Explore Shibuya and try popular local snacks.',
        45.00,
        'USD',
        180
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'Fushimi Inari shrine visit',
        'culture',
        'Walk through the famous torii gate trail.',
        0.00,
        'USD',
        150
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        'Dotonbori food tour',
        'food',
        'Try takoyaki, okonomiyaki, and local desserts.',
        55.00,
        'USD',
        180
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO trips (
    id,
    owner_id,
    title,
    description,
    start_date,
    end_date,
    base_currency,
    total_budget,
    visibility,
    status,
    share_slug
)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Japan spring trip',
    'A simple multi-city itinerary for Tokyo, Kyoto, and Osaka.',
    '2026-04-03',
    '2026-04-12',
    'USD',
    2500.00,
    'public',
    'planned',
    'japan-spring-demo'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO trip_stops (
    id,
    trip_id,
    city_id,
    stop_order,
    arrival_date,
    departure_date,
    lodging_name
)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        1,
        '2026-04-03',
        '2026-04-06',
        'Tokyo Central Hotel'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        2,
        '2026-04-06',
        '2026-04-09',
        'Kyoto Garden Stay'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000003',
        3,
        '2026-04-09',
        '2026-04-12',
        'Osaka Station Inn'
    )
ON CONFLICT (trip_id, stop_order) DO NOTHING;

INSERT INTO trip_activities (
    id,
    trip_id,
    stop_id,
    activity_id,
    title,
    description,
    scheduled_date,
    start_time,
    end_time,
    cost,
    currency
)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Shibuya crossing and street food walk',
        'Evening food walk near Shibuya.',
        '2026-04-04',
        '18:00',
        '21:00',
        45.00,
        'USD'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        'Fushimi Inari shrine visit',
        'Morning walk at Fushimi Inari.',
        '2026-04-07',
        '09:00',
        '11:30',
        0.00,
        'USD'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO trip_expenses (
    id,
    trip_id,
    stop_id,
    category,
    label,
    estimated_amount,
    currency,
    expense_date
)
VALUES
    (
        '60000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        NULL,
        'transport',
        'International flights',
        900.00,
        'USD',
        '2026-04-03'
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        'stay',
        'Tokyo hotel',
        420.00,
        'USD',
        '2026-04-03'
    ),
    (
        '60000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000002',
        'stay',
        'Kyoto hotel',
        360.00,
        'USD',
        '2026-04-06'
    ),
    (
        '60000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        'activities',
        'Shibuya food walk',
        45.00,
        'USD',
        '2026-04-04'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO packing_items (id, trip_id, item_name, category, quantity, is_packed)
VALUES
    (
        '70000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'Passport',
        'documents',
        1,
        false
    ),
    (
        '70000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        'Phone charger',
        'electronics',
        1,
        true
    ),
    (
        '70000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        'Light jacket',
        'clothing',
        1,
        false
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO trip_notes (
    id,
    trip_id,
    stop_id,
    created_by,
    note_date,
    title,
    body
)
VALUES (
    '80000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '2026-04-03',
    'Hotel check-in',
    'Ask for early check-in if the room is available.'
)
ON CONFLICT (id) DO NOTHING;
