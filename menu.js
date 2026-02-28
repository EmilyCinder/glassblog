document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const menuDrawer = document.getElementById("menuDrawer");
  const menuBackdrop = document.getElementById("menuBackdrop");
  const menuClose = document.getElementById("menuClose");

  if (!menuBtn || !menuDrawer || !menuBackdrop || !menuClose) {
    console.warn("Menu elements missing:", {
      menuBtn: !!menuBtn,
      menuDrawer: !!menuDrawer,
      menuBackdrop: !!menuBackdrop,
      menuClose: !!menuClose
    });
    return;
  }

  // Ensure closed state
  menuDrawer.classList.add("-translate-x-full");
  menuBackdrop.classList.add("hidden");
  menuBtn.setAttribute("aria-expanded", "false");

  function openMenu(){
    menuDrawer.classList.remove("-translate-x-full");
    menuBackdrop.classList.remove("hidden");
    menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu(){
    menuDrawer.classList.add("-translate-x-full");
    menuBackdrop.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu(){
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  }

  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  menuClose.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
  });

  menuBackdrop.addEventListener("click", closeMenu);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
});