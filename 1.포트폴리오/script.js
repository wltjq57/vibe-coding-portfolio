document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if (!navToggle || !nav) return;

  const toggleNav = () => {
    nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open");
  };

  navToggle.addEventListener("click", toggleNav);

  // 모바일에서 메뉴 클릭 시 자동 닫기
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900 && nav.classList.contains("is-open")) {
        toggleNav();
      }
    });
  });
});

