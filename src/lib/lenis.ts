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
