(() => {
  const DATA_PATH = "/assets/data/content/home.json";
  const STORAGE_KEY = `wsua-published-content:${DATA_PATH}`;

  async function fetchDefaultJson() {
    const response = await fetch(DATA_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load default file.");
    return response.json();
  }

  function setStatus(text, isError = false) {
    const status = document.getElementById("admin-local-status");
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("admin-local-status-error", isError);
  }

  function getTextareaValue() {
    const input = document.getElementById("admin-home-json");
    return input ? input.value : "";
  }

  function setTextareaValue(value) {
    const input = document.getElementById("admin-home-json");
    if (input) input.value = value;
  }

  function prettyJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function parseJsonFromText() {
    const raw = getTextareaValue();
    return JSON.parse(raw);
  }

  async function loadInitial() {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        setTextareaValue(prettyJson(JSON.parse(local)));
        setStatus("Loaded currently published local JSON.");
        return;
      }
      const defaults = await fetchDefaultJson();
      setTextareaValue(prettyJson(defaults));
      setStatus("Loaded file default JSON.");
    } catch (_err) {
      setStatus("Could not load default JSON.", true);
    }
  }

  async function loadDefaultFile() {
    try {
      const defaults = await fetchDefaultJson();
      setTextareaValue(prettyJson(defaults));
      setStatus("Loaded file default JSON.");
    } catch (_err) {
      setStatus("Failed to load default JSON file.", true);
    }
  }

  function publishLocal() {
    try {
      const parsed = parseJsonFromText();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setStatus("Published locally. Refresh homepage to preview changes.");
    } catch (_err) {
      setStatus("JSON is invalid. Fix formatting before publishing.", true);
    }
  }

  function clearLocalPublish() {
    localStorage.removeItem(STORAGE_KEY);
    setStatus("Cleared local publish override.");
  }

  function downloadJson() {
    try {
      const parsed = parseJsonFromText();
      const blob = new Blob([prettyJson(parsed)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "home.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Downloaded JSON file.");
    } catch (_err) {
      setStatus("JSON is invalid. Cannot download.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadInitial();

    document.getElementById("admin-load-default")?.addEventListener("click", loadDefaultFile);
    document.getElementById("admin-publish-local")?.addEventListener("click", publishLocal);
    document.getElementById("admin-clear-local")?.addEventListener("click", clearLocalPublish);
    document.getElementById("admin-download-json")?.addEventListener("click", downloadJson);
  });
})();
