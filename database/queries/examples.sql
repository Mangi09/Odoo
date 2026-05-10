-- Common Traveloop PostgreSQL queries

-- 1. Create a new user.
INSERT INTO users (full_name, email, password_hash)
VALUES ($1, $2, $3)
RETURNING id, full_name, email, created_at;

-- 2. Login lookup by email.
SELECT id, full_name, email, password_hash, role
FROM users
WHERE email = $1;

-- 3. Show dashboard trips for one user.
SELECT
    t.id,
    t.title,
    t.start_date,
    t.end_date,
    t.status,
    COUNT(ts.id) AS destination_count,
    COALESCE(bs.estimated_total, 0) AS estimated_total,
    t.total_budget
FROM trips t
LEFT JOIN trip_stops ts ON ts.trip_id = t.id
LEFT JOIN trip_budget_summary bs ON bs.trip_id = t.id
WHERE t.owner_id = $1
GROUP BY t.id, bs.estimated_total
ORDER BY t.start_date ASC;

-- 4. Create a new trip.
INSERT INTO trips (
    owner_id,
    title,
    description,
    start_date,
    end_date,
    cover_photo_url,
    total_budget,
    visibility
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- 5. Add a city stop to a trip.
INSERT INTO trip_stops (
    trip_id,
    city_id,
    stop_order,
    arrival_date,
    departure_date,
    lodging_name,
    notes
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- 6. Reorder cities in a trip.
UPDATE trip_stops
SET stop_order = $3
WHERE trip_id = $1 AND id = $2
RETURNING id, trip_id, stop_order;

-- 7. Search cities by text and optional country.
SELECT id, name, country, region, cost_index, popularity_score, image_url
FROM cities
WHERE
    (name ILIKE '%' || $1 || '%' OR country ILIKE '%' || $1 || '%')
    AND ($2::text IS NULL OR country = $2)
ORDER BY popularity_score DESC, name ASC
LIMIT 20;

-- 8. Search activities for a city.
SELECT id, name, category, description, estimated_cost, currency, duration_minutes, image_url
FROM activities
WHERE
    city_id = $1
    AND is_active = true
    AND ($2::text IS NULL OR category = $2)
    AND estimated_cost <= COALESCE($3::numeric, estimated_cost)
ORDER BY estimated_cost ASC, name ASC;

-- 9. Add an activity to a stop.
INSERT INTO trip_activities (
    trip_id,
    stop_id,
    activity_id,
    title,
    description,
    scheduled_date,
    start_time,
    end_time,
    cost,
    currency,
    notes
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

-- 10. Get complete itinerary in stop order.
SELECT
    t.id AS trip_id,
    t.title AS trip_title,
    c.name AS city_name,
    c.country,
    ts.stop_order,
    ts.arrival_date,
    ts.departure_date,
    ta.scheduled_date,
    ta.start_time,
    ta.end_time,
    ta.title AS activity_title,
    ta.cost,
    ta.currency
FROM trips t
JOIN trip_stops ts ON ts.trip_id = t.id
JOIN cities c ON c.id = ts.city_id
LEFT JOIN trip_activities ta ON ta.stop_id = ts.id
WHERE t.id = $1
ORDER BY ts.stop_order, ta.scheduled_date, ta.start_time;

-- 11. Add or update a budget item.
INSERT INTO trip_expenses (
    trip_id,
    stop_id,
    category,
    label,
    estimated_amount,
    actual_amount,
    currency,
    expense_date,
    notes
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- 12. Get trip budget summary.
SELECT *
FROM trip_budget_summary
WHERE trip_id = $1;

-- 13. Get trip budget category breakdown.
SELECT category, estimated_total, actual_total
FROM trip_expense_breakdown
WHERE trip_id = $1
ORDER BY estimated_total DESC;

-- 14. Add packing checklist item.
INSERT INTO packing_items (trip_id, item_name, category, quantity)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- 15. Mark checklist item as packed or unpacked.
UPDATE packing_items
SET is_packed = $3
WHERE trip_id = $1 AND id = $2
RETURNING *;

-- 16. Add a trip note.
INSERT INTO trip_notes (trip_id, stop_id, created_by, note_date, title, body)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- 17. Public itinerary page by share slug.
SELECT
    t.id,
    t.title,
    t.description,
    t.start_date,
    t.end_date,
    t.cover_photo_url,
    u.full_name AS owner_name
FROM trips t
JOIN users u ON u.id = t.owner_id
WHERE t.share_slug = $1 AND t.visibility = 'public';

-- 18. Admin: count trips created per month.
SELECT
    date_trunc('month', created_at) AS month,
    COUNT(*) AS trips_created
FROM trips
GROUP BY month
ORDER BY month DESC;

-- 19. Admin: top cities.
SELECT *
FROM popular_cities
LIMIT 10;
