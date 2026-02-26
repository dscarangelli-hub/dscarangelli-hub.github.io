/**
 * Fetch Ukraine air raid alert status by region from alerts.com.ua API
 * and write assets/data/ukraine-alerts.json for the utility bar air raid map.
 *
 * API: https://alerts.com.ua (or https://raid.fly.dev) — requires X-API-Key.
 * Request a key: email a@dun.ai or Telegram @andunai with "#api".
 *
 * Usage:
 *   ALERTS_API_KEY=https://alerts.com.ua/api/states node scripts/fetch-alerts.js
 *   # or set ALERTS_API_URL to override (default https://alerts.com.ua/api/states)
 *
 * Run on a schedule (e.g. every 1–2 min) or in CI to keep the map updated.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'assets', 'data', 'ukraine-alerts.json');

const API_URL = process.env.ALERTS_API_URL || 'https://alerts.com.ua/api/states';
const API_KEY = process.env.ALERTS_API_KEY || '';

/** Map API name_en to our SVG map oblast id (CodePen ukraine-map.svg) */
function nameEnToOblastId(nameEn) {
  if (!nameEn || typeof nameEn !== 'string') return null;
  const n = nameEn.trim().toLowerCase();
  const map = {
    'vinnytsia oblast': 'Vinnytsia',
    'volyn oblast': 'Volyn',
    'dnipropetrovsk oblast': 'Dnipropetrovsk',
    'donetsk oblast': 'Donetsk',
    'zhytomyr oblast': 'Zhytomyr',
    'zakarpattia oblast': 'Zakarpattia',
    'zaporizhia oblast': 'Zaporizhia',
    'ivano-frankivsk oblast': 'Ivano-Frankivsk',
    'kyiv oblast': 'Kiev',
    'kiev oblast': 'Kiev',
    'kyiv city': 'KyivCity',
    'kiev city': 'KyivCity',
    'kirovohrad oblast': 'Kirovohrad',
    'luhansk oblast': 'Luhansk',
    'lviv oblast': 'Lviv',
    'mykolaiv oblast': 'Mykolaiv',
    'poltava oblast': 'Poltava',
    'rivne oblast': 'Rivne',
    'sumy oblast': 'Sumu',
    'ternopil oblast': 'Ternopil',
    'kharkiv oblast': 'Kharkiv',
    'kherson oblast': 'Kherson',
    'khmelnytskyi oblast': 'Khmelnytskyi',
    'cherkasy oblast': 'Cherkasy',
    'chernivtsi oblast': 'Chernivtsi',
    'chernihiv oblast': 'Chernihiv',
    'odessa oblast': 'Odessa',
  };
  return map[n] || null;
}

async function fetchAlerts() {
  if (!API_KEY) {
    console.warn('ALERTS_API_KEY not set. Write fallback JSON with no data.');
    const fallback = { last_update: new Date().toISOString(), regions: {} };
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return;
  }

  const res = await fetch(API_URL, {
    headers: { 'X-API-Key': API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Alerts API ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const states = data.states || [];
  const regions = {};
  let lastUpdate = data.last_update || null;

  for (const s of states) {
    const oblastId = nameEnToOblastId(s.name_en);
    if (oblastId) {
      regions[oblastId] = !!s.alert;
    }
  }

  const out = { last_update: lastUpdate, regions };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', OUT_PATH, Object.keys(regions).length, 'regions');
}

fetchAlerts().catch((err) => {
  console.error(err);
  process.exit(1);
});
