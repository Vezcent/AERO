/**
 * ASTI i18n — Vietnamese / English language toggle
 *
 * Usage: Add `data-i18n="key"` to any element.
 * The element's textContent will be replaced with the translation.
 */

const translations = {
  en: {
    /* Nav */
    "nav.news": "News & Discoveries",
    "nav.fields": "Research Areas",
    "nav.services": "Services",
    "nav.training": "Training",
    "nav.about": "About Us",
    "nav.search": "Search",

    /* Home hero */
    "home.eyebrow": "ASTI · Ho Chi Minh City",
    "home.headline": "Aviation science forging new horizons.",
    "home.description": "Research, technology transfer, laboratory testing and professional training for Vietnam's infrastructure, transport and aviation sectors.",
    "home.cta1": "Learn about ASTI →",
    "home.cta2": "Explore projects →",

    /* Home cards */
    "home.card1": "Next-generation infrastructure materials research",
    "home.card2": "Airport apron load testing: precision for every flight",
    "home.card3": "Professional development and specialized training",
    "home.card4": "LAS-XD 216: certified testing capabilities",

    /* Home sections */
    "home.intro.label": "01 · Introduction",
    "home.intro.heading": "Connecting science with Vietnam's infrastructure and skies.",
    "home.intro.text": "The Aviation Science & Technology Institute was built upon the foundation of the Aviation Engineering Consulting Centre (1996), later restructured and renamed in 2007.",
    "home.intro.cta": "The ASTI story →",
    "home.fact1.title": "1996",
    "home.fact1.desc": "Foundation year of the organisation",
    "home.fact2.title": "LAS-XD 216",
    "home.fact2.desc": "Certified construction testing laboratory",
    "home.fact3.title": "ISO 9001:2008",
    "home.fact3.desc": "Quality management system maintained",

    "home.cap.label": "02 · Capabilities",
    "home.cap.heading": "From research to real-world deployment.",
    "home.cap.desc": "ASTI provides science and technology services for construction, transport and aviation.",
    "home.cap1": "Research & Transfer",
    "home.cap1.desc": "Research, experimental production and technology transfer.",
    "home.cap2": "Testing & Inspection",
    "home.cap2.desc": "Construction materials, components and structural evaluation.",
    "home.cap3": "Professional Training",
    "home.cap3.desc": "Aviation and engineering professional development.",
    "home.cap4": "Flight Training",
    "home.cap4.desc": "Operated by ASTI's Flight Training Centre.",
    "home.cap5": "Construction Consulting",
    "home.cap5.desc": "Supervision, survey and new-technology design.",

    "home.quality.label": "03 · Quality",
    "home.quality.heading": "Quality · Efficiency · Innovation.",
    "home.quality.text": "Laboratory LAS-XD 216 is accredited for operations; the quality management system for construction materials and geotechnical testing is maintained to ISO 9001:2008.",
    "home.quality.link": "Legal portfolio",

    "home.projects.label": "04 · Key Projects",
    "home.projects.heading": "Capability proven through real projects.",
    "home.projects.cta": "View all projects →",

    "home.contact.label": "Connect with ASTI",
    "home.contact.heading": "Start your next project.",
    "home.contact.cta": "Contact us →",

    /* Footer */
    "footer.address": "Aviation Science & Technology Institute · 156/12 Cộng Hòa, Ho Chi Minh City",
    "footer.contact": "028.38426046 · vienhangkhong2008@gmail.com",

    /* Language toggle */
    "lang.toggle": "VI"
  }
};

const STORAGE_KEY = "asti_lang";

function getLanguage() {
  return localStorage.getItem(STORAGE_KEY) || "vi";
}

function setLanguage(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations(lang);
  document.documentElement.lang = lang;
}

function applyTranslations(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.dataset.i18n;
    if (lang === "vi") {
      // Restore original text
      if (el.dataset.i18nOriginal) {
        el.textContent = el.dataset.i18nOriginal;
      }
    } else {
      // Save original and apply translation
      if (!el.dataset.i18nOriginal) {
        el.dataset.i18nOriginal = el.textContent;
      }
      const dict = translations[lang];
      if (dict && dict[key]) {
        el.textContent = dict[key];
      }
    }
  });

  // Update toggle button text
  const toggle = document.querySelector(".lang-toggle");
  if (toggle) {
    toggle.textContent = lang === "vi" ? "EN" : "VI";
    toggle.setAttribute("aria-label", lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const lang = getLanguage();
  if (lang !== "vi") {
    applyTranslations(lang);
    document.documentElement.lang = lang;
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".lang-toggle")) {
      const current = getLanguage();
      setLanguage(current === "vi" ? "en" : "vi");
    }
  });
});
