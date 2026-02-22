/* ============================================================
   UTILITY BAR — FULL JS ENGINE
   Handles:
   - UA time
   - 14‑item rotation
   - fade transitions
   - map region highlighting
   - daily fact
   - mission tagline
============================================================ */

/* -----------------------------
   1. UA TIME UPDATER
----------------------------- */
function updateUATime() {
  const uaTimeEl = document.getElementById("ua-time");
  if (!uaTimeEl) return;

  const now = new Date();
  const uaTime = now.toLocaleTimeString("en-GB", {
    timeZone: "Europe/Kyiv",
    hour: "2-digit",
    minute: "2-digit"
  });

  uaTimeEl.textContent = `UA ${uaTime}`;
}

setInterval(updateUATime, 1000);
updateUATime();

/* -----------------------------
   2. DAILY FACTS
----------------------------- */
const dailyFacts = [
  "Ukraine is home to the geographic center of Europe.",
  "The Ukrainian language is among the most melodic in the world.",
  "Kyiv’s St. Sophia Cathedral is a UNESCO World Heritage Site.",
  "The world’s largest aircraft, the AN‑225 Mriya, was built in Ukraine.",
  "Borshch, a Ukrainian dish, is recognized by UNESCO as cultural heritage.",
  "Lviv has more than 1,500 cafés — one of the highest per capita in Europe.",
  "The Trypillia culture in Ukraine dates back over 7,000 years."
];

// Pick one fact per page load
const todayFact = dailyFacts[Math.floor(Math.random() * dailyFacts.length)];

/* -----------------------------
   3. ROTATION ITEMS
----------------------------- */
const rotationItems = [
  // KYIV
  { text: "Kyiv: Weather — Clear", region: "wsua-region-kyiv" },
  { text: "Kyiv Region: Symbolic Alert", region: "wsua-region-kyiv" },

  // LVIV
  { text: "Lviv: Weather — Cloudy", region: "wsua-region-lviv" },
  { text: "Lviv Region: Symbolic Alert", region: "wsua-region-lviv" },

  // KHARKIV
  { text: "Kharkiv: Weather — Cold", region: "wsua-region-kharkiv" },
  { text: "Kharkiv Region: Symbolic Alert", region: "wsua-region-kharkiv" },

  // MYKOLAIV
  { text: "Mykolaiv: Weather — Clear", region: "wsua-region-mykolaiv" },
  { text: "Mykolaiv Region: Symbolic Alert", region: "wsua-region-mykolaiv" },

  // ODESA
  { text: "Odesa: Weather — Mild", region: "wsua-region-odesa" },
  { text: "Odesa Region: Symbolic Alert", region: "wsua-region-odesa" },

  // ZAPORIZHZHIA
  { text: "Zaporizhzhia: Weather — Cool", region: "wsua-region-zaporizhzhia" },
  { text: "Zaporizhzhia Region: Symbolic Alert", region: "wsua-region-zaporizhzhia" },

  // DAILY FACT
  { text: todayFact, region: null },

  // TAGLINE
  { text: "Western Solidarity — Standing with Ukraine", region: null }
];

/* -----------------------------
   4. MAP REGION HIGHLIGHT
----------------------------- */
const regionIds = [
  "wsua-region-kyiv",
  "wsua-region-lviv",
  "wsua-region-kharkiv",
  "wsua-region-mykolaiv",
  "wsua-region-odesa",
  "wsua-region-zaporizhzhia"
];

function setActiveRegion(regionId) {
  regionIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("wsua-region--active", id === regionId);
  });
}

/* -----------------------------
   5. ROTATION ENGINE
----------------------------- */
let index = 0;
const rotatorEl = document.getElementById("utility-rotating-text");

function rotateUtilityBar() {
  const item = rotationItems[index];

  // Fade out
  rotatorEl.classList.add("utility-fade-out");

  setTimeout(() => {
    // Update text
    rotatorEl.textContent = item.text;

    // Update map highlight
    if (item.region) {
      setActiveRegion(item.region);
    } else {
      // No region highlighted for fact + tagline
      setActiveRegion(null);
    }

    // Fade in
    rotatorEl.classList.remove("utility-fade-out");
  }, 250);

  // Move to next item
  index = (index + 1) % rotationItems.length;
}

// Start rotation
setInterval(rotateUtilityBar, 8000);
rotateUtilityBar();
