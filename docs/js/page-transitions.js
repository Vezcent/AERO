const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (!reducedMotion.matches) {
  const root = document.documentElement;
  const transition = document.createElement("div");
  let isLeaving = false;

  transition.className = "page-transition";
  transition.hidden = true;
  transition.setAttribute("aria-hidden", "true");
  document.body.append(transition);

  function finishEntrance() {
    root.classList.remove("is-page-entering");
    transition.hidden = true;
  }

  requestAnimationFrame(() => {
    transition.hidden = false;
    root.classList.add("is-page-entering");
    window.setTimeout(finishEntrance, 620);
  });

  document.addEventListener("click", (event) => {
    if (
      isLeaving ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const destination = new URL(link.href, window.location.href);
    const isSameHost = destination.protocol === window.location.protocol && destination.host === window.location.host;
    const isPage = destination.pathname.endsWith(".html") || destination.pathname.endsWith("/");
    const isFragmentOnly = destination.pathname === window.location.pathname && destination.hash;

    if (!isSameHost || !isPage || isFragmentOnly || destination.href === window.location.href) return;

    event.preventDefault();
    isLeaving = true;
    root.classList.remove("is-page-entering");
    root.classList.add("is-page-leaving");
    transition.hidden = false;

    window.setTimeout(() => window.location.assign(destination.href), 350);
  });

  window.addEventListener("pageshow", () => {
    isLeaving = false;
    root.classList.remove("is-page-entering", "is-page-leaving");
    transition.hidden = true;
  });
}
