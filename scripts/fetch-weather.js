/**
 * Fetch current weather for each Ukrainian oblast capital city
 * and write assets/data/ukraine-weather.json for the utility bar.
 *
 * This is similar in spirit to fetch-alerts.js, but uses a weather API
 * (e.g. OpenWeatherMap) keyed by capital city.
 *
 * Usage (example with OpenWeatherMap):
 *   WEATHER_API_KEY=yourKey node scripts/fetch-weather.js
 *
 * The script does NOT run automatically; add it to a cron/CI job.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'assets', 'data', 'ukraine-weather.json');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const WEATHER_API_URL =
  process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Map oblastId (SVG id) -> capital city name (in English) for weather API.
 * These are the administrative centers of the oblasts.
 */
const OBLAST_CAPITALS = {
  Vinnytsia: 'Vinnytsia',
  Volyn: 'Lutsk',
  Dnipropetrovsk: 'Dnipro',
  Donetsk: 'Donetsk',
  Zhytomyr: 'Zhytomyr',
  Zakarpattia: 'Uzhhorod',
  Zaporizhia: 'Zaporizhzhia',
  'Ivano-Frankivsk': 'Ivano-Frankivsk',
  Kiev: 'Kyiv',
  KyivCity: 'Kyiv',
  Kirovohrad: 'Kropyvnytskyi',
  Luhansk: 'Luhansk',
  Lviv: 'Lviv',
  Mykolaiv: 'Mykolaiv',
  Poltava: 'Poltava',
  Rivne: 'Rivne',
  Sumu: 'Sumy',
  Ternopil: 'Ternopil',
  Kharkiv: 'Kharkiv',
  Kherson: 'Kherson',
  Khmelnytskyi: 'Khmelnytskyi',
  Cherkasy: 'Cherkasy',
  Chernivtsi: 'Chernivtsi',
  Chernihiv: 'Chernihiv',
  Odessa: 'Odesa',
  Crimea: 'Simferopol',
  SevastopolCity: 'Sevastopol'
};

async function fetchWeatherForCity(city) {
  if (!WEATHER_API_KEY) {
    throw new Error('WEATHER_API_KEY not set – cannot fetch weather');
  }

  const params = new URLSearchParams({
    q: `${city},UA`,
    units: 'metric',
    appid: WEATHER_API_KEY
  });

  const res = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Weather API error for ${city}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const tempC = data.main && typeof data.main.temp === 'number' ? data.main.temp : null;
  const desc =
    Array.isArray(data.weather) && data.weather[0] && data.weather[0].description
      ? data.weather[0].description
      : null;

  return {
    tempC,
    desc
  };
}

async function fetchAllWeather() {
  if (!WEATHER_API_KEY) {
    console.warn('WEATHER_API_KEY not set. Writing empty ukraine-weather.json.');
    const fallback = { last_update: new Date().toISOString(), oblasti: {} };
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return;
  }

  const oblasti = {};
  const now = new Date().toISOString();

  for (const [oblastId, city] of Object.entries(OBLAST_CAPITALS)) {
    try {
      const w = await fetchWeatherForCity(city);
      if (w.tempC != null || w.desc) {
        oblasti[oblastId] = {
          tempC: w.tempC,
          weather: w.desc
        };
      }
    } catch (err) {
      console.warn(`Weather fetch failed for ${oblastId} (${city}):`, err.message);
    }
  }

  const out = { last_update: now, oblasti };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', OUT_PATH, Object.keys(oblasti).length, 'oblasti');
}

fetchAllWeather().catch((err) => {
  console.error(err);
  process.exit(1);
});

