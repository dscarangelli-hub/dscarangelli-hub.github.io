async function loadWSUADocuments(config) {
  const {
    repoOwner,
    repoName,
    folderPath,
    containerId,
    categories,
    iconMap
  } = config;

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;

  const response = await fetch(apiUrl);
  const files = await response.json();

  const container = document.getElementById(containerId);
  if (!container) return;

  const prettyName = (filename) => {
    return filename
      .replace(/[-_]/g, " ")
      .replace(/\.[^/.]+$/, "")
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const sorted = files
    .filter(f => f.type === "file")
    .sort((a, b) => b.name.localeCompare(a.name));

  sorted.forEach(file => {
    const ext = file.name.split(".").pop().toLowerCase();
    const icon = iconMap[ext] || iconMap["default"];

    const title = prettyName(file.name);
    const size = formatSize(file.size);

    const item = document.createElement("li");
    item.className = "document";

    item.innerHTML = `
      <img src="${icon}" class="doc-icon" alt="File icon">
      <div class="doc-info">
        <a href="/${folderPath}/${file.name}" class="doc-title">${title}</a>
        <p class="doc-meta">${ext.toUpperCase()} • ${size}</p>
      </div>
    `;

    // If categories exist, sort into them
    if (categories) {
      let matched = false;
      for (const cat of Object.keys(categories)) {
        if (file.name.toLowerCase().includes(categories[cat])) {
          if (!container.querySelector(`h3[data-cat="${cat}"]`)) {
            const header = document.createElement("h3");
            header.textContent = cat;
            header.dataset.cat = cat;
            container.appendChild(header);
          }
          container.appendChild(item);
          matched = true;
          break;
        }
      }

      if (!matched) {
        if (!container.querySelector(`h3[data-cat="Other"]`)) {
          const header = document.createElement("h3");
          header.textContent = "Other";
          header.dataset.cat = "Other";
          container.appendChild(header);
        }
        container.appendChild(item);
      }

    } else {
      // No categories → simple list
      container.appendChild(item);
    }
  });
}
