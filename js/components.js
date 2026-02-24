/* ===========================
   COMPONENTS.JS
   Shared UI Logic
   =========================== */

/* Shared Pagination Logic */
document.addEventListener("DOMContentLoaded", () => {
    const paginations = document.querySelectorAll('.pagination');

    paginations.forEach(pagination => {
        pagination.querySelectorAll('a').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                pagination.querySelectorAll('a').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });
});
