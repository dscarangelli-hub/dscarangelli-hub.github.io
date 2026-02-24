/* ===========================
   LIBRARY.JS
   Document Library Logic
   =========================== */

let currentPDF = "";

/* PDF Viewer */
function previewPDF(url, title = "Document Preview") {
    currentPDF = url;
    document.getElementById("pdfTitle").innerText = title;
    document.getElementById("previewFrame").src = url;
    document.getElementById("previewModal").style.display = "flex";
}

function closePreview() {
    document.getElementById("previewModal").style.display = "none";
}

function downloadPDF() {
    window.open(currentPDF, "_blank");
}

/* Category Filters */
function filterDocs(category) {
    document.querySelectorAll('.doc-card').forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category)
            ? 'block'
            : 'none';
    });

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter-' + category).classList.add('active');
}

/* Search */
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("docSearch");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();

            document.querySelectorAll(".doc-card").forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(query) ? "block" : "none";
            });
        });
    }
});

/* Pagination */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.pagination a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.pagination a').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
