async function loadWSUADocuments(config) {
  const {
    repoOwner,
    repoName,
    folderPath,
    containerId,
    categories,
    iconMap,
    currentIssueId = null,
    enablePreviews = false,
    gridMode = false
  } = config;

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
  const response = await fetch(apiUrl);
  const files = await response.json();

  const container = document.getElementById(containerId);
  if (!container) return;

  const currentIssueBox = currentIssueId ? document.getElementById(currentIssueId) : null;

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

  // Sort newest → oldest by filename
  const sorted = files
    .filter(f => f.type === "file")
    .sort((a, b) => b.name.localeCompare(a.name));

  // CURRENT ISSUE
  if (currentIssueBox && sorted.length > 0) {
    const newest = sorted[0];
    const newestTitle = prettyName(newest.name);
    const baseName = newest.name.replace(".pdf", "");

    const previewPath = `/assets/images/newsletter/previews/${baseName}.png`;
    const fallbackPath = `/assets/images/newsletter/template-embroidery.svg`;

    currentIssueBox.style.display = "block";
    currentIssueBox.innerHTML = `
      <h3>${newestTitle}</h3>
      ${enablePreviews ? `
        <img src="${previewPath}"
             onerror="this.src='${fallbackPath}'"
             alt="Preview"
             style="width:100%; border-radius:8px; margin:10px 0;">
      ` : ""}
      <a href="/${folderPath}/${newest.name}" class="btn-primary" target="_blank">Read Issue</a>
    `;
  } else if (currentIssueBox && sorted.length === 0) {
    currentIssueBox.innerHTML = "<p class=\"newsletter-loading\">No issues yet. Check back soon.</p>";
  }

  // GRID MODE (Newsletter)
  if (gridMode) {
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
    container.style.gap = "1.5rem";
  }

  // ARCHIVE ITEMS
  const archiveFiles = currentIssueId && currentIssueBox && sorted.length > 0
    ? sorted.slice(1)
    : sorted;

  archiveFiles.forEach(file => {
    const ext = file.name.split(".").pop().toLowerCase();
    const icon = iconMap[ext] || iconMap["default"];
    const title = prettyName(file.name);
    const size = formatSize(file.size);
    const baseName = file.name.replace(".pdf", "");

    // Newsletter card mode
    if (gridMode) {
      const card = document.createElement("div");
      card.className = "newsletter-card";
      card.style = `
        background:white;
        padding:20px;
        border-radius:12px;
        border:1px solid #ddd;
        box-shadow:0 4px 12px rgba(0,0,0,0.08);
      `;

      const previewPath = `/assets/images/newsletter/previews/${baseName}.png`;
      const fallbackPath = `/assets/images/newsletter/template-embroidery.svg`;

      const preview = enablePreviews
        ? `<img src="${previewPath}"
                 onerror="this.src='${fallbackPath}'"
                 alt="Preview"
                 style="width:100%; border-radius:8px; margin-bottom:10px;">`
        : `<img src="${icon}" class="doc-icon" style="width:48px; margin-bottom:10px;">`;

      card.innerHTML = `
        ${preview}
        <h3>${title}</h3>
        <p style="font-size:0.9rem; color:#555; margin-bottom:10px;">${ext.toUpperCase()} • ${size}</p>
        <a href="/${folderPath}/${file.name}" class="btn-primary" target="_blank">Read</a>
      `;

      container.appendChild(card);
      return;
    }

    // Default list mode (Transparency, Legal pages)
    const item = document.createElement("li");
    item.className = "document";

    item.innerHTML = `
      <img src="${icon}" class="doc-icon" alt="File icon">
      <div class="doc-info">
        <a href="/${folderPath}/${file.name}" class="doc-title">${title}</a>
        <p class="doc-meta">${ext.toUpperCase()} • ${size}</p>
      </div>
    `;

    // Category sorting (unchanged)
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
      container.appendChild(item);
    }
  });
}

