function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("open");

  // Prevent background scrolling
  if (menu.classList.contains("open")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

// Close menu when clicking outside
document.addEventListener("click", function(e) {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".hamburger");

  if (menu.classList.contains("open") &&
      !menu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    toggleMobileMenu();
  }
});
