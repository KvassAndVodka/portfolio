import type Lenis from "lenis";

let instance: Lenis | null = null;

/** Set by SmoothScroll while it runs; kept here (no CSS import) so any module can read it. */
export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

/** The running Lenis instance, or null under reduced motion. Lets sections scroll to a position smoothly. */
export function getLenis() {
  return instance;
}

/** Scrolls so `element` sits just under the sticky header: smoothly, or at once under reduced motion. */
export function scrollBelowHeader(element: HTMLElement) {
  const offset = -(document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0) - 16;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (instance) instance.scrollTo(element, { offset, immediate: reduce, duration: 0.6 });
  else window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? "auto" : "smooth" });
}
