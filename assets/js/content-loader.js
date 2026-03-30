(() => {
  const PAGE_CONTENT_CONFIG = {
    "/": "/assets/data/content/home.json",
    "/index.html": "/assets/data/content/home.json",
  };

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, part) => {
      if (acc == null) return undefined;
      if (/^\d+$/.test(part)) return acc[Number(part)];
      return acc[part];
    }, obj);
  }

  function sanitizePath(pathname) {
    if (!pathname) return "/";
    return pathname.endsWith("/") ? pathname : pathname;
  }

  function getContentPath(pathname) {
    const clean = sanitizePath(pathname);
    return PAGE_CONTENT_CONFIG[clean];
  }

  function readLocalOverride(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_err) {
      return null;
    }
  }

  function applyContent(content) {
    const nodes = document.querySelectorAll("[data-content-field]");
    nodes.forEach((node) => {
      const field = node.getAttribute("data-content-field");
      if (!field) return;
      const value = getByPath(content, field);
      if (typeof value !== "string") return;
      node.innerHTML = value;
    });
  }

  async function loadContent() {
    const dataPath = getContentPath(window.location.pathname);
    if (!dataPath) return;

    const overrideKey = `wsua-published-content:${dataPath}`;
    const override = readLocalOverride(overrideKey);
    if (override) {
      applyContent(override);
      return;
    }

    try {
      const response = await fetch(dataPath, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      applyContent(data);
    } catch (_err) {
      // Keep static fallback markup if fetch fails.
    }
  }

  document.addEventListener("DOMContentLoaded", loadContent);
})();
