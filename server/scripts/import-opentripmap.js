const { loadEnvFile } = require("../src/config/env");

loadEnvFile();

const { pool } = require("../src/db/pool");

const apiKey = process.env.OPENTRIPMAP_API_KEY;
const cityLimit = Number(process.env.OTM_CITY_LIMIT || 25);
const placesPerCity = Number(process.env.OTM_PLACES_PER_CITY || 8);
const radiusMeters = Number(process.env.OTM_RADIUS_METERS || 7000);
const requestDelayMs = Number(process.env.OTM_REQUEST_DELAY_MS || 900);
const cityDelayMs = Number(process.env.OTM_CITY_DELAY_MS || 2500);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const categoryFromKinds = (kinds = "") => {
  const value = kinds.toLowerCase();

  if (value.includes("foods") || value.includes("restaurants")) return "food";
  if (
    value.includes("museums") ||
    value.includes("theatres") ||
    value.includes("cultural")
  )
    return "culture";
  if (
    value.includes("natural") ||
    value.includes("beaches") ||
    value.includes("parks")
  )
    return "nature";
  if (value.includes("sport") || value.includes("amusements"))
    return "adventure";
  if (value.includes("shops")) return "shopping";
  if (value.includes("nightclubs")) return "nightlife";
  if (value.includes("historic") || value.includes("architecture"))
    return "sightseeing";

  return "other";
};

const apiGet = async (path) => {
  const url = `https://api.opentripmap.com/0.1/en/places/${path}&apikey=${apiKey}`;
  await sleep(requestDelayMs);
  const response = await fetch(url);

  if (response.status === 429) {
    await sleep(5000);
    const retryResponse = await fetch(url);

    if (!retryResponse.ok) {
      throw new Error(
        `OpenTripMap request failed: ${retryResponse.status} ${retryResponse.statusText}`,
      );
    }

    return retryResponse.json();
  }

  if (!response.ok) {
    throw new Error(
      `OpenTripMap request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

const importCityActivities = async (city) => {
  const places = await apiGet(
    `radius?radius=${radiusMeters}&lon=${city.longitude}&lat=${city.latitude}&rate=2&limit=${placesPerCity}&format=json`,
  );

  let imported = 0;

  for (const place of places) {
    if (!place.xid || !place.name) {
      continue;
    }

    let details = {};

    try {
      details = await apiGet(`xid/${encodeURIComponent(place.xid)}?`);
    } catch (err) {
      console.warn(`Skipping details for ${place.name}: ${err.message}`);
    }

    const description =
      details.wikipedia_extracts?.text ||
      details.info?.descr ||
      place.kinds ||
      null;

    const imageUrl = details.preview?.source || details.image || null;
    const sourceUrl = details.otm || details.wikipedia || details.url || null;

    await pool.query(
      `INSERT INTO activities (
         city_id,
         name,
         category,
         description,
         estimated_cost,
         currency,
         duration_minutes,
         image_url,
         external_source,
         external_id,
         source_url,
         latitude,
         longitude,
         image_source,
         image_source_url
       )
       VALUES ($1, $2, $3, $4, 0, 'USD', 90, $5, 'opentripmap', $6, $7, $8, $9, $10, $11)
       ON CONFLICT (external_source, external_id)
       WHERE external_source IS NOT NULL AND external_id IS NOT NULL
       DO UPDATE
       SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url,
         source_url = EXCLUDED.source_url,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         image_source = EXCLUDED.image_source,
         image_source_url = EXCLUDED.image_source_url`,
      [
        city.id,
        place.name,
        categoryFromKinds(place.kinds),
        description,
        imageUrl,
        place.xid,
        sourceUrl,
        place.point?.lat || null,
        place.point?.lon || null,
        imageUrl ? "OpenTripMap" : null,
        sourceUrl,
      ],
    );

    imported += 1;
  }

  return imported;
};

const main = async () => {
  if (!apiKey) {
    throw new Error("OPENTRIPMAP_API_KEY is missing in server/.env");
  }

  const result = await pool.query(
    `SELECT id, name, country, latitude, longitude
     FROM cities
     WHERE latitude IS NOT NULL AND longitude IS NOT NULL
     ORDER BY popularity_score DESC, population DESC NULLS LAST, name ASC
     LIMIT $1`,
    [cityLimit],
  );

  let total = 0;

  for (const city of result.rows) {
    console.log(`Importing activities for ${city.name}, ${city.country}...`);
    try {
      total += await importCityActivities(city);
    } catch (err) {
      console.warn(`Skipping ${city.name}: ${err.message}`);
    }
    await sleep(cityDelayMs);
  }

  console.log(`Imported or updated ${total} activities from OpenTripMap.`);
  await pool.end();
};

main().catch(async (err) => {
  console.error(err.message);
  await pool.end();
  process.exit(1);
});
