/**
 * Fetch Ukraine air raid alert status by region and write assets/data/ukraine-alerts.json.
 *
 * Supports two providers:
 * 1) alerts.in.ua (recommended): set ALERTS_IN_UA_TOKEN
 *    - API docs: https://devs.alerts.in.ua/
 * 2) alerts.com.ua / raid.fly.dev: set ALERTS_API_KEY
 *
 * If neither token/key is set, script writes live:false fallback JSON.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'assets', 'data', 'ukraine-alerts.json');

const API_KEY = process.env.ALERTS_API_KEY || '';
const ALERTS_IN_UA_TOKEN = process.env.ALERTS_IN_UA_TOKEN || '';
const ALERTS_IN_UA_URL = process.env.ALERTS_IN_UA_URL || 'https://api.alerts.in.ua/v1/alerts/active.json';
const ALERTS_API_URL = process.env.ALERTS_API_URL || 'https://alerts.com.ua/api/states';

function toKey(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[`'".,]/g, '')
    .replace(/\s+/g, ' ');
}

/** Map English/Ukrainian oblast names to SVG IDs. */
function locationToOblastId(name) {
  const n = toKey(name);
  const map = {
    // English
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
    'kropyvnytskyi oblast': 'Kirovohrad',
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
    'odesa oblast': 'Odessa',
    // Ukrainian
    'вінницька область': 'Vinnytsia',
    'волинська область': 'Volyn',
    'дніпропетровська область': 'Dnipropetrovsk',
    'донецька область': 'Donetsk',
    'житомирська область': 'Zhytomyr',
    'закарпатська область': 'Zakarpattia',
    'запорізька область': 'Zaporizhia',
    'івано-франківська область': 'Ivano-Frankivsk',
    'київська область': 'Kiev',
    'м київ': 'KyivCity',
    'м. київ': 'KyivCity',
    'кіровоградська область': 'Kirovohrad',
    'луганська область': 'Luhansk',
    'львівська область': 'Lviv',
    'миколаївська область': 'Mykolaiv',
    'полтавська область': 'Poltava',
    'рівненська область': 'Rivne',
    'сумська область': 'Sumu',
    'тернопільська область': 'Ternopil',
    'харківська область': 'Kharkiv',
    'херсонська область': 'Kherson',
    'хмельницька область': 'Khmelnytskyi',
    'черкаська область': 'Cherkasy',
    'чернівецька область': 'Chernivtsi',
    'чернігівська область': 'Chernihiv',
    'одеська область': 'Odessa'
  };
  return map[n] || null;
}

function writeFallback() {
  const fallback = {
    live: false,
    last_update: new Date().toISOString(),
    regions: {}
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(fallback, null, 2), 'utf8');
}

async function fetchFromAlertsComUa() {
  const res = await fetch(ALERTS_API_URL, {
    headers: { 'X-API-Key': API_KEY }
  });
  if (!res.ok) {
    throw new Error(`alerts.com.ua ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  const states = data.states || [];
  const regions = {};
  for (const s of states) {
    const oblastId = locationToOblastId(s.name_en || s.name_uk);
    if (oblastId) regions[oblastId] = !!s.alert;
  }
  return {
    live: true,
    last_update: data.last_update || new Date().toISOString(),
    regions
  };
}

async function fetchFromAlertsInUa() {
  const res = await fetch(ALERTS_IN_UA_URL, {
    headers: { Authorization: `Bearer ${ALERTS_IN_UA_TOKEN}` }
  });
  if (!res.ok) {
    throw new Error(`alerts.in.ua ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];
  const regions = {};
  for (const a of alerts) {
    const type = (a.alert_type || '').toString().toLowerCase();
    const locType = (a.location_type || '').toString().toLowerCase();
    if (type !== 'air_raid') continue;
    if (locType && locType !== 'oblast' && locType !== 'state') continue;
    const oblastId = locationToOblastId(a.location_title || a.location_oblast || a.location_name);
    if (oblastId) regions[oblastId] = true;
  }
  return {
    live: true,
    last_update: data.last_updated_at || new Date().toISOString(),
    regions
  };
}

async function fetchAlerts() {
  if (!ALERTS_IN_UA_TOKEN && !API_KEY) {
    console.warn('No alert provider token/key set. Writing live:false fallback JSON.');
    writeFallback();
    return;
  }

  let out;
  if (ALERTS_IN_UA_TOKEN) {
    out = await fetchFromAlertsInUa();
  } else {
    out = await fetchFromAlertsComUa();
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', OUT_PATH, Object.keys(out.regions || {}).length, 'regions');
}

fetchAlerts().catch((err) => {
  console.error(err);
  process.exit(1);
});
