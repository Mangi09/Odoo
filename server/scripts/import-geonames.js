const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { loadEnvFile } = require('../src/config/env');

loadEnvFile();

const { pool } = require('../src/db/pool');

const rootDir = path.join(__dirname, '..', '..');
const geonamesDir = path.join(rootDir, 'data', 'raw', 'geonames');
const citiesPath = path.join(geonamesDir, 'cities5000.txt');
const countriesPath = path.join(geonamesDir, 'countryInfo.txt');

const continentNames = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America'
};

const assertFile = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found at ${filePath}`);
  }
};

const importCountries = async () => {
  if (!fs.existsSync(countriesPath)) {
    console.log('countryInfo.txt not found, skipping country import');
    return 0;
  }

  const stream = fs.createReadStream(countriesPath, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;

  for await (const line of rl) {
    if (!line || line.startsWith('#')) {
      continue;
    }

    const columns = line.split('\t');
    const code = columns[0];
    const name = columns[4];
    const capital = columns[5] || null;
    const region = continentNames[columns[8]] || columns[8] || null;
    const currencyCode = columns[10] || null;
    const phoneCode = columns[12] || null;

    if (!code || !name) {
      continue;
    }

    await pool.query(
      `INSERT INTO countries (code, name, region, capital, currency_code, phone_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE
       SET
         name = EXCLUDED.name,
         region = EXCLUDED.region,
         capital = EXCLUDED.capital,
         currency_code = EXCLUDED.currency_code,
         phone_code = EXCLUDED.phone_code`,
      [code, name, region, capital, currencyCode, phoneCode]
    );

    count += 1;
  }

  return count;
};

const importCities = async () => {
  assertFile(citiesPath, 'cities5000.txt');

  const stream = fs.createReadStream(citiesPath, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const countryNames = new Map();
  let count = 0;

  const countryResult = await pool.query('SELECT code, name FROM countries');

  for (const country of countryResult.rows) {
    countryNames.set(country.code, country.name);
  }

  for await (const line of rl) {
    if (!line) {
      continue;
    }

    const columns = line.split('\t');
    const geonameId = Number(columns[0]);
    const name = columns[1];
    const latitude = columns[4] ? Number(columns[4]) : null;
    const longitude = columns[5] ? Number(columns[5]) : null;
    const countryCode = columns[8];
    const population = columns[14] ? Number(columns[14]) : 0;
    const timezone = columns[17] || null;
    const country = countryNames.get(countryCode) || countryCode;

    if (!geonameId || !name || !countryCode) {
      continue;
    }

    await pool.query(
      `INSERT INTO cities (
         geoname_id,
         name,
         country,
         country_code,
         population,
         latitude,
         longitude,
         timezone,
         cost_index,
         popularity_score
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 3.00, 0)
       ON CONFLICT (name, country) DO UPDATE
       SET
         geoname_id = COALESCE(cities.geoname_id, EXCLUDED.geoname_id),
         country_code = EXCLUDED.country_code,
         population = EXCLUDED.population,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         timezone = EXCLUDED.timezone`,
      [geonameId, name, country, countryCode, population, latitude, longitude, timezone]
    );

    count += 1;

    if (count % 1000 === 0) {
      console.log(`Imported ${count} cities...`);
    }
  }

  return count;
};

const main = async () => {
  console.log('Starting GeoNames import...');
  const countryCount = await importCountries();
  const cityCount = await importCities();
  console.log(`Imported ${countryCount} countries and ${cityCount} city rows.`);
  await pool.end();
};

main().catch(async (err) => {
  console.error(err.message);
  await pool.end();
  process.exit(1);
});
