/* ===========================
   LEGAL.JS
   Legal Research Hub Logic
   =========================== */

/* Expand/Collapse Research Updates */
function toggleUpdate(btn) {
    const full = btn.nextElementSibling;
    const isOpen = full.style.display === "block";

    full.style.display = isOpen ? "none" : "block";
    btn.innerText = isOpen ? "Read More" : "Show Less";
}

/* Submit Research Form */
function submitResearch() {
    const name = document.getElementById("srName").value.trim();
    const email = document.getElementById("srEmail").value.trim();
    const summary = document.getElementById("srSummary").value.trim();

    if (!name || !email || !summary) {
        alert("Please fill out all required fields before submitting.");
        return;
    }

    alert("Thank you! Your research submission has been received.");
}

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
