/* ── Solar System Main Menu & Dive In Controller ── */
window.astiDiveState = window.astiDiveState || { progress: 0, target: 0, mouseX: 0, mouseY: 0 };

const solarMenu = document.querySelector("#solar-menu");
const siteShell = document.querySelector("#site-shell");
const diveBtn = document.querySelector("#dive-btn");
const orbitMenuBtn = document.querySelector("#orbit-menu-btn");

function setDivedState(isDived) {
  if (isDived) {
    if (solarMenu) solarMenu.classList.add("is-dived");
    if (siteShell) {
      siteShell.classList.remove("in-menu");
      requestAnimationFrame(() => {
        siteShell.classList.add("is-active");
        // Trigger reveal animations inside site shell
        document.querySelectorAll("#site-shell .reveal").forEach((el) => el.classList.add("is-visible"));
      });
    }
    window.astiDiveState.target = 1.0;
  } else {
    if (solarMenu) solarMenu.classList.remove("is-dived");
    if (siteShell) {
      siteShell.classList.remove("is-active");
      siteShell.classList.add("in-menu");
    }
    window.astiDiveState.target = 0.0;
  }
}

if (solarMenu && diveBtn) {
  const alreadyDived = sessionStorage.getItem("asti_dived") === "true";
  if (alreadyDived) {
    setDivedState(true);
  } else {
    setDivedState(false);
  }

  diveBtn.addEventListener("click", () => {
    sessionStorage.setItem("asti_dived", "true");
    setDivedState(true);
  });
} else if (siteShell) {
  siteShell.classList.remove("in-menu");
  siteShell.classList.add("is-active");
  window.astiDiveState.target = 1.0;
}

if (orbitMenuBtn) {
  orbitMenuBtn.addEventListener("click", () => {
    sessionStorage.removeItem("asti_dived");
    setDivedState(false);
  });
}

/* ── Nav toggle ── */
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.dataset.open !== "true";
    nav.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/* ── Parallax on hero ── */
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
if (hero && !prefersReducedMotion.matches && matchMedia("(hover: hover)").matches) {
  let scheduled = false;
  let position = { x: 0, y: 0 };

  function applyParallax() {
    document.documentElement.style.setProperty("--parallax-x", `${position.x * 7}px`);
    document.documentElement.style.setProperty("--parallax-y", `${position.y * 7}px`);
    scheduled = false;
  }

  hero.addEventListener("pointermove", ({ clientX, clientY }) => {
    position = { x: clientX / innerWidth - 0.5, y: clientY / innerHeight - 0.5 };
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(applyParallax);
    }
  });
  hero.addEventListener("pointerleave", () => {
    position = { x: 0, y: 0 };
    requestAnimationFrame(applyParallax);
  });
}

/* ── Scroll-reveal observer ── */
const revealElements = document.querySelectorAll(".reveal");
if (revealElements.length && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );
  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

/* ── Active nav link highlight ── */
const currentPath = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPath || (currentPath === "" && href === "index.html")) {
    link.setAttribute("aria-current", "page");
  }
});

/* ── Carousel auto-advance for slide-index (home page) ── */
const slideIndex = document.querySelector(".slide-index");
if (slideIndex) {
  const spans = slideIndex.querySelectorAll("span");
  let activeIndex = 0;

  function activateSlide(index) {
    spans.forEach((s, i) => {
      s.style.color = i === index ? "white" : "";
      s.style.borderRight = i === index ? "1px solid var(--cyan)" : "none";
    });
  }

  if (spans.length > 1) {
    setInterval(() => {
      activeIndex = (activeIndex + 1) % spans.length;
      activateSlide(activeIndex);
    }, 5000);
  }
}

/* ── Scroll to top button ── */
const scrollTopBtn = document.querySelector(".scroll-top");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("is-visible", scrollY > 600);
  }, { passive: true });
  scrollTopBtn.addEventListener("click", () => {
    scrollTo({ top: 0, behavior: "smooth" });
  });
}
