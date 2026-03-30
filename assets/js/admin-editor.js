(() => {
  const STORAGE_KEY = "wsua-editable-content-v1";
  const ADMIN_FLAG_KEY = "wsua-admin-mode";

  const state = {
    adminEnabled: false,
    editingEnabled: false,
  };

  function getPageKey() {
    return window.location.pathname || "/";
  }

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_err) {
      return {};
    }
  }

  function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function ensureAutoEditableIds() {
    const candidates = document.querySelectorAll(
      "main h1, main h2, main h3, main h4, main p, .hero-title, .hero-subtitle"
    );
    let autoIndex = 0;
    candidates.forEach((node) => {
      if (node.getAttribute("data-editable-id")) return;
      if (!node.textContent || !node.textContent.trim()) return;
      node.setAttribute("data-editable-id", `auto-editable-${autoIndex}`);
      autoIndex += 1;
    });
  }

  function getEditableNodes() {
    return Array.from(document.querySelectorAll("[data-editable-id]"));
  }

  function applySavedContent() {
    const store = loadStore();
    const pageData = store[getPageKey()] || {};
    getEditableNodes().forEach((node) => {
      const id = node.getAttribute("data-editable-id");
      if (!id) return;
      if (Object.prototype.hasOwnProperty.call(pageData, id)) {
        node.innerHTML = pageData[id];
      }
    });
  }

  function setEditingState(enabled) {
    state.editingEnabled = enabled;
    getEditableNodes().forEach((node) => {
      node.contentEditable = enabled ? "true" : "false";
      node.classList.toggle("editable-active", enabled);
    });
    const toggle = document.getElementById("admin-edit-toggle");
    if (toggle) {
      toggle.textContent = enabled ? "Disable Editing" : "Enable Editing";
    }
  }

  function persistPageContent() {
    const store = loadStore();
    const pageKey = getPageKey();
    store[pageKey] = store[pageKey] || {};
    getEditableNodes().forEach((node) => {
      const id = node.getAttribute("data-editable-id");
      if (!id) return;
      store[pageKey][id] = node.innerHTML;
    });
    saveStore(store);
  }

  function resetPageContent() {
    const store = loadStore();
    const pageKey = getPageKey();
    if (store[pageKey]) {
      delete store[pageKey];
      saveStore(store);
    }
    window.location.reload();
  }

  function createAdminPanel() {
    const panel = document.createElement("div");
    panel.className = "admin-controls";
    panel.innerHTML = `
      <p class="admin-controls-title">Admin Controls</p>
      <button id="admin-edit-toggle" type="button">Enable Editing</button>
      <button id="admin-save" type="button">Save Text Changes</button>
      <button id="admin-reset" type="button">Reset This Page</button>
    `;
    document.body.appendChild(panel);

    const toggle = document.getElementById("admin-edit-toggle");
    const save = document.getElementById("admin-save");
    const reset = document.getElementById("admin-reset");

    toggle?.addEventListener("click", () => setEditingState(!state.editingEnabled));
    save?.addEventListener("click", () => {
      persistPageContent();
      setEditingState(false);
      window.alert("Text changes saved in this browser.");
    });
    reset?.addEventListener("click", () => {
      const confirmed = window.confirm("Reset all saved text edits for this page?");
      if (confirmed) resetPageContent();
    });
  }

  function shouldEnableAdmin() {
    const url = new URL(window.location.href);
    const param = url.searchParams.get("admin");
    if (param === "1") {
      localStorage.setItem(ADMIN_FLAG_KEY, "true");
      return true;
    }
    if (param === "0") {
      localStorage.removeItem(ADMIN_FLAG_KEY);
      return false;
    }
    return localStorage.getItem(ADMIN_FLAG_KEY) === "true";
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureAutoEditableIds();
    applySavedContent();
    state.adminEnabled = shouldEnableAdmin();
    if (!state.adminEnabled) return;
    createAdminPanel();
  });
})();
