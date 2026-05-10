# Traveloop PostgreSQL Part

This folder contains the database side for the Traveloop project idea from the PDF.

## Suggested File Structure

```text
traveloop/
  database/
    migrations/
      001_init.sql
    seeds/
      001_demo_data.sql
    queries/
      examples.sql
  server/
    src/
      db/
        pool.js              # optional backend connection file
        trip.repository.js   # optional SQL functions for trips
        city.repository.js   # optional SQL functions for cities
```

## Tables You Should Make

Core tables:

- `users`: login/signup, profile, role.
- `cities`: searchable destination list with country, region, cost index, popularity.
- `activities`: things to do inside each city.
- `trips`: one travel plan created by a user.
- `trip_stops`: city-wise stops inside a trip, ordered by travel flow.
- `trip_activities`: selected or custom activities scheduled into a stop.
- `trip_expenses`: transport, stay, activities, meals, shopping, and other budget items.

Feature tables:

- `packing_items`: per-trip packing checklist.
- `trip_notes`: notes or journal entries tied to a trip or stop.
- `saved_cities`: destinations saved in user profile.
- `trip_collaborators`: friends who can view or edit a trip.
- `trip_copies`: tracks when a public trip is copied.

Helpful views:

- `trip_budget_summary`: total budget vs estimated and actual spend.
- `trip_expense_breakdown`: category-wise cost breakdown.
- `popular_cities`: admin analytics for top cities.

## How To Run

Create a database:

```powershell
createdb traveloop
```

Run the schema:

```powershell
psql -U postgres -d traveloop -f .\database\migrations\001_init.sql
```

Add demo data:

```powershell
psql -U postgres -d traveloop -f .\database\seeds\001_demo_data.sql
```

Try example queries manually from:

```text
database/queries/examples.sql
```

## Why This Schema Fits Traveloop

The main relationship is:

```text
users -> trips -> trip_stops -> trip_activities
                  |
                  -> trip_expenses
                  -> packing_items
                  -> trip_notes
```

This supports the screens in the project idea: login, dashboard, create trip, my trips, itinerary builder, itinerary view, city search, activity search, budget breakdown, checklist, public sharing, profile saved destinations, notes, and admin analytics.
