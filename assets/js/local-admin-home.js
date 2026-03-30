(() => {
  const HOME_DATA_PATH = "/assets/data/content/home.json";
  const UPDATES_DATA_PATH = "/assets/data/content/updates.json";
  const HOME_STORAGE_KEY = `wsua-published-content:${HOME_DATA_PATH}`;
  const UPDATES_STORAGE_KEY = `wsua-published-content:${UPDATES_DATA_PATH}`;

  async function fetchDefaultJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load default file.");
    return response.json();
  }

  function setStatus(statusId, text, isError = false) {
    const status = document.getElementById(statusId);
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("admin-local-status-error", isError);
  }

  function getTextareaValue(id) {
    const input = document.getElementById(id);
    return input ? input.value : "";
  }

  function setTextareaValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value;
  }

  function prettyJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function parseJsonFromText(id) {
    const raw = getTextareaValue(id);
    return JSON.parse(raw);
  }

  async function loadInitial() {
    try {
      const localHome = localStorage.getItem(HOME_STORAGE_KEY);
      if (localHome) {
        setTextareaValue("admin-home-json", prettyJson(JSON.parse(localHome)));
        setStatus("admin-local-status", "Loaded currently published local home JSON.");
      } else {
        const homeDefaults = await fetchDefaultJson(HOME_DATA_PATH);
        setTextareaValue("admin-home-json", prettyJson(homeDefaults));
        setStatus("admin-local-status", "Loaded file default home JSON.");
      }

      const localUpdates = localStorage.getItem(UPDATES_STORAGE_KEY);
      if (localUpdates) {
        setTextareaValue("admin-updates-json", prettyJson(JSON.parse(localUpdates)));
        setStatus("admin-updates-status", "Loaded currently published local updates JSON.");
      } else {
        const updateDefaults = await fetchDefaultJson(UPDATES_DATA_PATH);
        setTextareaValue("admin-updates-json", prettyJson(updateDefaults));
        setStatus("admin-updates-status", "Loaded file default updates JSON.");
      }
      refreshPostList();
    } catch (_err) {
      setStatus("admin-local-status", "Could not load default home JSON.", true);
      setStatus("admin-updates-status", "Could not load default updates JSON.", true);
    }
  }

  async function loadDefaultFile(textareaId, dataPath, statusId) {
    try {
      const defaults = await fetchDefaultJson(dataPath);
      setTextareaValue(textareaId, prettyJson(defaults));
      setStatus(statusId, "Loaded file default JSON.");
      if (textareaId === "admin-updates-json") refreshPostList();
    } catch (_err) {
      setStatus(statusId, "Failed to load default JSON file.", true);
    }
  }

  function publishLocal(textareaId, storageKey, statusId) {
    try {
      const parsed = parseJsonFromText(textareaId);
      localStorage.setItem(storageKey, JSON.stringify(parsed));
      setStatus(statusId, "Published locally.");
    } catch (_err) {
      setStatus(statusId, "JSON is invalid. Fix formatting before publishing.", true);
    }
  }

  function clearLocalPublish(storageKey, statusId) {
    localStorage.removeItem(storageKey);
    setStatus(statusId, "Cleared local publish override.");
  }

  function downloadJson(textareaId, filename, statusId) {
    try {
      const parsed = parseJsonFromText(textareaId);
      const blob = new Blob([prettyJson(parsed)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(statusId, "Downloaded JSON file.");
    } catch (_err) {
      setStatus(statusId, "JSON is invalid. Cannot download.", true);
    }
  }

  function getUpdatesObject() {
    return parseJsonFromText("admin-updates-json");
  }

  function saveUpdatesObject(obj) {
    setTextareaValue("admin-updates-json", prettyJson(obj));
    refreshPostList();
  }

  function refreshPostList() {
    const select = document.getElementById("admin-post-list");
    if (!select) return;
    select.innerHTML = "";
    try {
      const updatesObj = getUpdatesObject();
      const posts = Array.isArray(updatesObj.posts) ? updatesObj.posts : [];
      posts.forEach((post, idx) => {
        const opt = document.createElement("option");
        opt.value = String(idx);
        opt.textContent = `${idx + 1}. ${post.date || ""} - ${post.title || ""}`;
        select.appendChild(opt);
      });
    } catch (_err) {
      setStatus("admin-updates-status", "Fix updates JSON to use post manager.", true);
    }
  }

  function addPost() {
    try {
      const updatesObj = getUpdatesObject();
      updatesObj.posts = Array.isArray(updatesObj.posts) ? updatesObj.posts : [];
      const date = document.getElementById("admin-new-post-date")?.value.trim() || "";
      const title = document.getElementById("admin-new-post-title")?.value.trim() || "";
      const body = document.getElementById("admin-new-post-body")?.value.trim() || "";
      if (!title || !body) {
        setStatus("admin-updates-status", "New post needs at least title and body.", true);
        return;
      }
      updatesObj.posts.unshift({ date, title, body });
      saveUpdatesObject(updatesObj);
      setStatus("admin-updates-status", "Added new post.");
    } catch (_err) {
      setStatus("admin-updates-status", "Could not add post. Check JSON.", true);
    }
  }

  function moveSelected(direction) {
    const select = document.getElementById("admin-post-list");
    if (!select || select.selectedIndex < 0) return;
    try {
      const updatesObj = getUpdatesObject();
      updatesObj.posts = Array.isArray(updatesObj.posts) ? updatesObj.posts : [];
      const idx = select.selectedIndex;
      const target = idx + direction;
      if (target < 0 || target >= updatesObj.posts.length) return;
      const temp = updatesObj.posts[idx];
      updatesObj.posts[idx] = updatesObj.posts[target];
      updatesObj.posts[target] = temp;
      saveUpdatesObject(updatesObj);
      const updatedSelect = document.getElementById("admin-post-list");
      if (updatedSelect) updatedSelect.selectedIndex = target;
      setStatus("admin-updates-status", "Reordered post.");
    } catch (_err) {
      setStatus("admin-updates-status", "Could not reorder posts.", true);
    }
  }

  function deleteSelected() {
    const select = document.getElementById("admin-post-list");
    if (!select || select.selectedIndex < 0) return;
    try {
      const updatesObj = getUpdatesObject();
      updatesObj.posts = Array.isArray(updatesObj.posts) ? updatesObj.posts : [];
      updatesObj.posts.splice(select.selectedIndex, 1);
      saveUpdatesObject(updatesObj);
      setStatus("admin-updates-status", "Deleted selected post.");
    } catch (_err) {
      setStatus("admin-updates-status", "Could not delete selected post.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadInitial();

    document.getElementById("admin-load-default")?.addEventListener("click", () => {
      loadDefaultFile("admin-home-json", HOME_DATA_PATH, "admin-local-status");
    });
    document.getElementById("admin-publish-local")?.addEventListener("click", () => {
      publishLocal("admin-home-json", HOME_STORAGE_KEY, "admin-local-status");
    });
    document.getElementById("admin-clear-local")?.addEventListener("click", () => {
      clearLocalPublish(HOME_STORAGE_KEY, "admin-local-status");
    });
    document.getElementById("admin-download-json")?.addEventListener("click", () => {
      downloadJson("admin-home-json", "home.json", "admin-local-status");
    });

    document.getElementById("admin-updates-load-default")?.addEventListener("click", () => {
      loadDefaultFile("admin-updates-json", UPDATES_DATA_PATH, "admin-updates-status");
    });
    document.getElementById("admin-updates-publish-local")?.addEventListener("click", () => {
      publishLocal("admin-updates-json", UPDATES_STORAGE_KEY, "admin-updates-status");
    });
    document.getElementById("admin-updates-clear-local")?.addEventListener("click", () => {
      clearLocalPublish(UPDATES_STORAGE_KEY, "admin-updates-status");
    });
    document.getElementById("admin-updates-download-json")?.addEventListener("click", () => {
      downloadJson("admin-updates-json", "updates.json", "admin-updates-status");
    });

    document.getElementById("admin-updates-json")?.addEventListener("input", refreshPostList);
    document.getElementById("admin-post-add")?.addEventListener("click", addPost);
    document.getElementById("admin-post-up")?.addEventListener("click", () => moveSelected(-1));
    document.getElementById("admin-post-down")?.addEventListener("click", () => moveSelected(1));
    document.getElementById("admin-post-delete")?.addEventListener("click", deleteSelected);
  });
})();
