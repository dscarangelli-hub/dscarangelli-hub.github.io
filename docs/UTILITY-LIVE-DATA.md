# Utility bar: live weather & air alerts

The header utility bar reads JSON from `assets/data/`:

| File | Source | API key |
|------|--------|---------|
| `ukraine-weather.json` | [Open-Meteo](https://open-meteo.com/) (capital coordinates per oblast) | **None** |
| `ukraine-alerts.json` | [alerts.in.ua](https://devs.alerts.in.ua/) (preferred) or [alerts.com.ua](https://alerts.com.ua/) fallback via `scripts/fetch-alerts.js` | `ALERTS_IN_UA_TOKEN` preferred; optional `ALERTS_API_KEY` fallback |

## GitHub Actions

Workflow **Fetch Ukraine live data** (`.github/workflows/fetch-ukraine-live-data.yml`) runs every 30 minutes and on push when the scripts change. It:

1. Runs `node scripts/fetch-weather.js` (always works without secrets).
2. Runs `node scripts/fetch-alerts.js` (provider priority: `ALERTS_IN_UA_TOKEN`, then `ALERTS_API_KEY`; writes `live: false` and empty `regions` if neither is set).

To enable **live air-raid shading** on the map, add repository secret `ALERTS_IN_UA_TOKEN` (preferred). Keep `ALERTS_API_KEY` only as an optional legacy fallback.

## Local refresh

```bash
node scripts/fetch-weather.js
# optional:
ALERTS_IN_UA_TOKEN=... node scripts/fetch-alerts.js
# or legacy provider:
ALERTS_API_KEY=... node scripts/fetch-alerts.js
```

## Open-Meteo attribution

Open-Meteo is free for non-commercial use; consider crediting them (e.g. site footer or this doc). Data: **Open-Meteo.com**.

## GitHub Pages `baseurl`

If the site uses a **project page** (`username.github.io/repo/`), set `baseurl` in `_config.yml`. The layout sets `window.__WSUA_BASE__` and loads `utility-bar.js` via `relative_url` so map, SVG, and JSON paths resolve correctly.
