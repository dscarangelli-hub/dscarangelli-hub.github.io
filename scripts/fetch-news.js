/**
 * Fetch Ukraine news from RSS (EN + UK sources), translate titles to both languages
 * via MyMemory free API, and write assets/data/ukraine-news.json for the utility bar.
 * Safe for business/nonprofit use; runs in GitHub Actions (2026).
 * Free tier: 5,000 chars/day anonymous; 50,000 chars/day if MYMEMORY_EMAIL env is set.
 */

import Parser from 'rss-parser';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'assets', 'data', 'ukraine-news.json');

const parser = new Parser({ timeout: 10000 });

// Reputable, free RSS feeds (not Russian-affiliated). Mix of EN and Ukrainian.
const RSS_FEEDS = [
  { url: 'https://kyivindependent.com/feed/', name: 'Kyiv Independent', lang: 'en' },
  { url: 'https://www.ukrinform.net/rss/block-lastnews', name: 'Ukrinform', lang: 'en' },
  { url: 'https://www.ukrinform.ua/rss/block-lastnews', name: 'Ukrinform UA', lang: 'uk' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World', lang: 'en' },
  { url: 'https://www.theguardian.com/world/rss', name: 'Guardian World', lang: 'en' },
];

const UKRAINE_KEYWORDS = [
  'ukraine', 'ukrainian', 'kyiv', 'kiev', 'kharkiv', 'odesa', 'lviv', 'donbas',
  'україн', 'украина', 'київ', 'киев', 'харків', 'одеса', 'львів', 'донбас', 'зсу', 'україни'
];

const CATEGORIES = {
  sports: ['sport', 'football', 'soccer', 'tennis', 'olympics', 'athlete', 'спорт', 'футбол', 'олімпіад'],
  humanitarian: ['aid', 'humanitarian', 'refugee', 'relief', 'donation', 'ngo', 'допомог', 'благодійн', 'громад'],
  celebrity: ['singer', 'actor', 'artist', 'film', 'concert', 'festival', 'співак', 'актор', 'фільм', 'концерт'],
  'civil-society': ['volunteer', 'activist', 'community', 'civil society', 'волонтер', 'громадськ', 'активіст']
};

function isAboutUkraine(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return UKRAINE_KEYWORDS.some(k => t.includes(k.toLowerCase()));
}

function detectCategory(title) {
  const t = (title || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => t.includes(k))) return cat;
  }
  return 'general';
}

function isMostlyCyrillic(str) {
  const cyrillic = (str || '').replace(/\s/g, '').match(/[\u0400-\u04FF]/g);
  const total = (str || '').replace(/\s/g, '').length;
  return total > 0 && cyrillic && cyrillic.length / total >= 0.3;
}

async function translateMyMemory(text, fromUkToEn) {
  if (!text || text.length > 500) return text;
  const langpair = fromUkToEn ? 'uk|en' : 'en|uk';
  let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const email = process.env.MYMEMORY_EMAIL;
  if (email && typeof email === 'string' && email.includes('@')) {
    url += `&de=${encodeURIComponent(email.trim())}`;
  }
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (_) {}
  return text;
}

async function fetchAllItems() {
  const items = [];
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const feedItems = (parsed.items || []).slice(0, 6).map(item => ({
        title: (item.title || '').trim(),
        link: item.link || item.guid || '',
        source: feed.name,
        lang: feed.lang,
        category: detectCategory(item.title || '')
      }));
      items.push(...feedItems);
    } catch (e) {
      console.error('Feed failed:', feed.url, e.message);
    }
  }
  return items;
}

function filterAndDedupe(items) {
  const seen = new Set();
  return items
    .filter(i => i.title && i.link && isAboutUkraine(i.title))
    .filter(i => {
      const key = i.link || i.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

async function main() {
  const raw = await fetchAllItems();
  const filtered = filterAndDedupe(raw);

  const results = [];
  for (const item of filtered) {
    let titleEn = item.title;
    let titleUk = item.title;
    if (isMostlyCyrillic(item.title)) {
      titleEn = await translateMyMemory(item.title, true);
      await new Promise(r => setTimeout(r, 300));
    } else {
      titleUk = await translateMyMemory(item.title, false);
      await new Promise(r => setTimeout(r, 300));
    }
    results.push({
      title_en: titleEn || item.title,
      title_uk: titleUk || item.title,
      url: item.link,
      category: item.category,
      source: item.source
    });
  }

  mkdirSync(join(__dirname, '..', 'assets', 'data'), { recursive: true });
  const out = {
    updated_at: new Date().toISOString(),
    year: 2026,
    items: results
  };
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', results.length, 'items to', OUT_PATH);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
