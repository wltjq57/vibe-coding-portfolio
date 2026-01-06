document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");

  // 헤더 스크롤 그림자 효과
  const handleScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  // 모바일 내비게이션 토글
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // 내비 링크 클릭 시 메뉴 닫기 (모바일)
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 부드러운 스크롤 헬퍼
  const smoothScrollTo = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 상단 내비게이션 앵커 부드러운 스크롤
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      smoothScrollTo(href);
    });
  });

  // 버튼들 동작 연결
  const contactButtons = [
    ...document.querySelectorAll(".hero-actions .btn-primary"),
    ...document.querySelectorAll(".about .btn-primary"),
  ];

  contactButtons.forEach((btn) => {
    btn.addEventListener("click", () => smoothScrollTo("#contact"));
  });

  const portfolioButtons = document.querySelectorAll(
    ".cap-actions .btn-primary"
  );
  portfolioButtons.forEach((btn) => {
    btn.addEventListener("click", () => smoothScrollTo("#projects"));
  });

  const comingSoonButtons = document.querySelectorAll(
    ".hero-actions .btn-secondary, .cap-actions .btn-secondary"
  );
  comingSoonButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("준비 중인 기능입니다. 곧 업데이트될 예정이에요 🙂");
    });
  });
});

