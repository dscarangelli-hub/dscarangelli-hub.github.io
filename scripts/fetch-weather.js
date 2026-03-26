/**
 * Fetch current weather for each Ukrainian oblast (capital coordinates)
 * and write assets/data/ukraine-weather.json for the utility bar.
 *
 * Default: Open-Meteo (no API key). Optional: OpenWeatherMap if WEATHER_API_KEY is set.
 *
 * Usage:
 *   node scripts/fetch-weather.js
 *   WEATHER_API_KEY=... node scripts/fetch-weather.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'assets', 'data', 'ukraine-weather.json');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const OPENWEATHER_URL =
  process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather';

const OBLAST_COORDS = {
  Vinnytsia: [49.2328, 28.481],
  Volyn: [50.7472, 25.3254],
  Dnipropetrovsk: [48.4647, 35.0462],
  Donetsk: [48.0159, 37.8028],
  Zhytomyr: [50.2547, 28.6587],
  Zakarpattia: [48.6208, 22.2879],
  Zaporizhia: [47.8388, 35.1396],
  'Ivano-Frankivsk': [48.9226, 24.7111],
  Kiev: [50.4501, 30.5234],
  KyivCity: [50.4501, 30.5234],
  Kirovohrad: [48.5079, 32.2623],
  Luhansk: [48.574, 39.3078],
  Lviv: [49.8397, 24.0297],
  Mykolaiv: [46.975, 31.9946],
  Poltava: [49.5883, 34.5514],
  Rivne: [50.6231, 26.2273],
  Sumu: [50.9077, 34.7981],
  Ternopil: [49.5535, 25.5948],
  Kharkiv: [49.9935, 36.2304],
  Kherson: [46.6354, 32.6169],
  Khmelnytskyi: [49.4229, 27.0013],
  Cherkasy: [49.4444, 32.0598],
  Chernivtsi: [48.2915, 25.9403],
  Chernihiv: [51.4982, 31.2893],
  Odessa: [46.4825, 30.7233],
  Crimea: [44.9521, 34.1024],
  SevastopolCity: [44.6167, 33.5254]
};

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

function wmoToWeather(code) {
  const c = Number(code);
  if (c === 0) return '☀️ Clear';
  if (c === 1) return '🌤️ Mainly clear';
  if (c === 2) return '⛅ Partly cloudy';
  if (c === 3) return '☁️ Overcast';
  if (c === 45 || c === 48) return '🌫️ Fog';
  if (c >= 51 && c <= 55) return '🌦️ Drizzle';
  if (c >= 56 && c <= 57) return '🌨️ Freezing drizzle';
  if (c >= 61 && c <= 65) return '🌧️ Rain';
  if (c >= 66 && c <= 67) return '🌧️ Freezing rain';
  if (c >= 71 && c <= 77) return '❄️ Snow';
  if (c >= 80 && c <= 82) return '🌧️ Rain showers';
  if (c >= 85 && c <= 86) return '❄️ Snow showers';
  if (c >= 95 && c <= 99) return '⛈️ Thunderstorm';
  return '🌡️ —';
}

async function fetchOpenWeatherCity(city) {
  const params = new URLSearchParams({
    q: `${city},UA`,
    units: 'metric',
    appid: WEATHER_API_KEY
  });

  const res = await fetch(`${OPENWEATHER_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`OpenWeather API error for ${city}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const tempC = data.main && typeof data.main.temp === 'number' ? data.main.temp : null;
  const desc =
    Array.isArray(data.weather) && data.weather[0] && data.weather[0].description
      ? data.weather[0].description
      : null;

  return {
    tempC,
    weather: desc ? `🌡️ ${desc}` : '🌡️ —'
  };
}

async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,weather_code',
    timezone: 'Europe/Kyiv'
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = await res.json();
  const cur = data.current || {};
  return {
    tempC: typeof cur.temperature_2m === 'number' ? cur.temperature_2m : null,
    weather: wmoToWeather(cur.weather_code)
  };
}

async function fetchAllWeather() {
  const oblasti = {};
  const now = new Date().toISOString();

  for (const [oblastId, coords] of Object.entries(OBLAST_COORDS)) {
    try {
      const city = OBLAST_CAPITALS[oblastId];
      const w = WEATHER_API_KEY
        ? await fetchOpenWeatherCity(city)
        : await fetchOpenMeteo(coords[0], coords[1]);
      if (w.tempC != null || w.weather) {
        oblasti[oblastId] = {
          tempC: w.tempC,
          weather: w.weather
        };
      }
    } catch (err) {
      console.warn(`Weather fetch failed for ${oblastId}:`, err.message);
    }
  }

  const out = {
    last_update: now,
    source: WEATHER_API_KEY ? 'OpenWeatherMap' : 'Open-Meteo',
    oblasti
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', OUT_PATH, Object.keys(oblasti).length, 'oblasti');
}

fetchAllWeather().catch((err) => {
  console.error(err);
  process.exit(1);
});

