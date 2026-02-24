// ------------------------------------------------------------
// WSUA Full-Site Search Logic
// ------------------------------------------------------------

let fuse = null;

// Initialize Fuse.js once the index is loaded
document.addEventListener("DOMContentLoaded", () => {
    fuse = new Fuse(window.WSUA_SEARCH_INDEX, {
        keys: ["title", "content"],
        threshold: 0.3
    });
});

// Toggle search bar on desktop
function toggleSearch() {
    const container = document.getElementById("search-container");
    container.classList.toggle("active");

    const input = document.getElementById("search-input");
    if (container.classList.contains("active")) {
        input.focus();
    }
}

// Run search
function runSearch() {
    const query = document.getElementById("search-input").value.trim();
    const resultsBox = document.getElementById("search-results");

    if (!query) {
        resultsBox.classList.remove("active");
        resultsBox.innerHTML = "";
        return;
    }

    const results = fuse.search(query);

    if (results.length === 0) {
        resultsBox.innerHTML = `<div class="no-results">No results found</div>`;
        resultsBox.classList.add("active");
        return;
    }

    resultsBox.innerHTML = results
        .map(r => `
            <a href="${r.item.url}">
                <strong>${r.item.title}</strong><br>
                <span>${r.item.content.substring(0, 80)}...</span>
            </a>
        `)
        .join("");

    resultsBox.classList.add("active");
}
