(() => {
  const PAGE_CONTENT_CONFIG = {
    "/": ["/assets/data/content/home.json", "/assets/data/content/updates.json"],
    "/index.html": ["/assets/data/content/home.json", "/assets/data/content/updates.json"],
    "/updates/": ["/assets/data/content/updates.json"],
    "/updates/index.html": ["/assets/data/content/updates.json"],
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

  function getContentPaths(pathname) {
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
      let value = getByPath(content, field);
      if (typeof value !== "string") {
        value = getByPath(content.home || {}, field);
      }
      if (typeof value !== "string") {
        value = getByPath(content.updates || {}, field);
      }
      if (typeof value !== "string") return;
      node.innerHTML = value;
    });
  }

  function createUpdateCard(post) {
    const article = document.createElement("article");
    article.className = "update-card";

    const date = document.createElement("p");
    date.className = "update-date";
    date.textContent = post.date || "";

    const title = document.createElement("h3");
    title.textContent = post.title || "";

    const body = document.createElement("p");
    body.textContent = post.body || "";

    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(body);
    return article;
  }

  function renderUpdatesList(content) {
    const posts = getByPath(content, "updates.posts");
    if (!Array.isArray(posts)) return;
    const listNodes = document.querySelectorAll("[data-updates-list]");
    listNodes.forEach((node) => {
      const mode = node.getAttribute("data-updates-list");
      const limit = Number(node.getAttribute("data-updates-limit") || "0");
      let data = posts;
      if (mode === "home" && limit > 0) {
        data = posts.slice(0, limit);
      }
      node.innerHTML = "";
      data.forEach((post) => node.appendChild(createUpdateCard(post)));
    });
  }

  async function readJsonWithOverride(dataPath) {
    const overrideKey = `wsua-published-content:${dataPath}`;
    const localData = readLocalOverride(overrideKey);
    if (localData) return localData;
    const response = await fetch(dataPath, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  }

  async function loadContent() {
    const dataPaths = getContentPaths(window.location.pathname);
    if (!Array.isArray(dataPaths) || dataPaths.length === 0) return;

    const merged = {};
    for (const dataPath of dataPaths) {
      const json = await readJsonWithOverride(dataPath);
      if (!json || typeof json !== "object") continue;
      const key = dataPath.endsWith("updates.json") ? "updates" : "home";
      merged[key] = json;
    }

    if (Object.keys(merged).length === 0) return;
    applyContent(merged);
    renderUpdatesList(merged);
  }

  async function init() {
    try {
      await loadContent();
    } catch (_err) {
      return;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
