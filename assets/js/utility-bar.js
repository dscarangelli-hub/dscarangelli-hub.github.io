<script>
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- DATA ---------- */

  const cities = [
    {
      city: "Kyiv",
      temp: "3°C",
      weather: "☁️ Cloudy",
      alert: "🟡 Elevated Risk",
      photo: "/assets/images/cities/kyiv.jpg",
      oblastId: "oblast-kyiv-city"
    },
    {
      city: "Lviv",
      temp: "-1°C",
      weather: "❄️ Snow",
      alert: "🟡 Elevated Risk",
      photo: "/assets/images/cities/lviv.jpg",
      oblastId: "oblast-lviv"
    },
    {
      city: "Kharkiv",
      temp: "0°C",
      weather: "🌫️ Fog",
      alert: "🔴 Critical",
      photo: "/assets/images/cities/kharkiv.jpg",
      oblastId: "oblast-kharkiv"
    },
    {
      city: "Odesa",
      temp: "4°C",
      weather: "🌧️ Rain",
      alert: "🟠 High Risk",
      photo: "/assets/images/cities/odesa.jpg",
      oblastId: "oblast-odesa"
    },
    {
      city: "Dnipro",
      temp: "2°C",
      weather: "☁️ Cloudy",
      alert: "🟡 Elevated Risk",
      photo: "/assets/images/cities/dnipro.jpg",
      oblastId: "oblast-dnipropetrovsk"
    },
    {
      city: "Zaporizhzhia",
      temp: "1°C",
      weather: "🌤️ Partly Cloudy",
      alert: "🟡 Elevated Risk",
      photo: "/assets/images/cities/zaporizhzhia.jpg",
      oblastId: "oblast-zaporizhzhia"
    }
  ];

  const todayInUkraine = [
    "Today in Ukraine: In 1991, Ukraine moved toward independence and a new future.",
    "Today in Ukraine: Communities continue to rebuild, resist, and protect their culture.",
    "Today in Ukraine: Global solidarity remains vital for justice and recovery."
  ];

  const wordsOfTheDay = [
    { uk: "Дякую", en: "Thank you" },
    { uk: "Солідарність", en: "Solidarity" },
    { uk: "Надія", en: "Hope" },
    { uk: "Свобода", en: "Freedom" }
  ];

  const quotes = [
    "“Fight — and you shall overcome.” — Taras Shevchenko",
    "“Our soul shall never perish, freedom knows no dying.” — Ukrainian verse",
    "“When we stand together, we are unbreakable.” — Ukrainian saying"
  ];

  const helpCTAs = [
    { text: "How You Can Help Today: Support Humanitarian Aid →", href: "/donate" },
    { text: "How You Can Help Today: Back Legal Research & Justice →", href: "/programs/legal-research" },
    { text: "How You Can Help Today: Strengthen Community Resilience →", href: "/programs/community" }
  ];

  const trustBadges = [
    { icon: "🛡️", label: "501(c)(3) Verified" },
    { icon: "🔒", label: "Secure Donations" },
    { icon: "💳", label: "Givebutter Verified" },
    { icon: "🌍", label: "Wise Global Banking" }
  ];

  const factOfDay = {
    text: "Fact of the Day: Ukraine is home to the world’s deepest metro station (Arsenalna in Kyiv).",
    href: "/learn/ukraine-facts"
  };

  /* ---------- ELEMENTS ---------- */

  const cityPhotoEl = document.getElementById('city-photo');
  const cityTextEl = document.getElementById('city-spotlight-text');
  const rotationContainer = document.getElementById('rotation-container');
  const rotationCta = document.getElementById('rotation-cta');
  const trustBadgesEl = document.getElementById('trust-badges');
  const factOfDayEl = document.getElementById('fact-of-day');
  const mapTooltip = document.getElementById('map-tooltip');
  const oblastEls = document.querySelectorAll('.oblast');

  /* ---------- CITY ROTATION + MAP HIGHLIGHT ---------- */

  let cityIndex = 0;

  function setActiveOblast(oblastId) {
    oblastEls.forEach(o => o.classList.remove('oblast-active'));
    if (!oblastId) return;
    const active = document.getElementById(oblastId);
    if (active) active.classList.add('oblast-active');
  }

  function rotateCity() {
    const data = cities[cityIndex];

    cityPhotoEl.src = data.photo;
    cityPhotoEl.alt = data.city + " photo";

    cityTextEl.textContent = `${data.city} — ${data.temp} • ${data.weather} • ${data.alert}`;

    setActiveOblast(data.oblastId);

    cityIndex = (cityIndex + 1) % cities.length;
  }

  /* ---------- CULTURAL + MISSION ROTATION ---------- */

  let rotationIndex = 0;
  const rotationItems = [];

  todayInUkraine.forEach(text => {
    rotationItems.push({
      type: "today",
      text,
      ctaStyle: "blue"
    });
  });

  wordsOfTheDay.forEach(item => {
    rotationItems.push({
      type: "word",
      text: `🇺🇦 Word of the Day: ${item.uk} — “${item.en}”`,
      ctaStyle: "blue"
    });
  });

  quotes.forEach(q => {
    rotationItems.push({
      type: "quote",
      text: q,
      ctaStyle: "blue"
    });
  });

  helpCTAs.forEach(item => {
    rotationItems.push({
      type: "cta",
      text: item.text,
      href: item.href,
      ctaStyle: "gold"
    });
  });

  rotationItems.push({
    type: "trust",
    text: "Trusted, transparent, and accountable support for Ukraine.",
    ctaStyle: "neutral"
  });

  function renderTrustBadges() {
    trustBadgesEl.innerHTML = "";
    trustBadges.forEach(badge => {
      const span = document.createElement('span');
      span.className = "trust-badge-item";
      span.innerHTML = `<span>${badge.icon}</span><span>${badge.label}</span>`;
      trustBadgesEl.appendChild(span);
    });
  }

  function clearTrustBadges() {
    trustBadgesEl.innerHTML = "";
  }

  function applyCtaStyle(style) {
    rotationCta.classList.remove('blue', 'gold', 'neutral');
    rotationCta.classList.add(style);
  }

  function rotateCultural() {
    const item = rotationItems[rotationIndex];

    rotationContainer.classList.remove('show');

    setTimeout(() => {
      rotationContainer.textContent = item.text;

      clearTrustBadges();

      if (item.type === "trust") {
        renderTrustBadges();
        rotationCta.textContent = "Why trust WSUA?";
        rotationCta.href = "/about#trust";
      } else if (item.type === "cta") {
        rotationCta.textContent = "Take Action →";
        rotationCta.href = item.href || "/donate";
      } else {
        rotationCta.textContent = "Learn More →";
        rotationCta.href = "/learn";
      }

      applyCtaStyle(item.ctaStyle || "blue");

      rotationContainer.classList.add('show');
    }, 200);

    rotationIndex = (rotationIndex + 1) % rotationItems.length;
  }

  /* ---------- FACT OF THE DAY ---------- */

  function renderFactOfDay() {
    factOfDayEl.innerHTML = `
      ${factOfDay.text}
      <a href="${factOfDay.href}">Learn more →</a>
    `;
  }

  /* ---------- MAP CLICK + TOOLTIP ---------- */

  oblastEls.forEach(oblast => {
    oblast.addEventListener('click', () => {
      const region = oblast.dataset.region;
      if (!region) return;
      window.location.href = `/regions/${region}`;
    });

    oblast.addEventListener('mousemove', (e) => {
      const name = oblast.dataset.name || "Ukraine Region";
      mapTooltip.textContent = name;
      mapTooltip.style.left = e.clientX + "px";
      mapTooltip.style.top = e.clientY + "px";
      mapTooltip.style.opacity = "1";
    });

    oblast.addEventListener('mouseleave', () => {
      mapTooltip.style.opacity = "0";
    });
  });

  /* ---------- INIT ---------- */

  rotateCity();
  rotateCultural();
  renderFactOfDay();

  setInterval(rotateCity, 6000);
  setInterval(rotateCultural, 7000);
});
</script>
