/**
 * Switches the theme as a circle of the new palette growing out of the control that was pressed, using a View
 * Transition: the browser snapshots the page, applies the new theme, and this reveals it through an expanding
 * clip. Falls back to an instant switch under reduced motion or where View Transitions aren't supported.
 */
export function switchTheme(setTheme: (theme: string) => void, next: string, origin?: HTMLElement | null) {
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const resolved = next === "system" ? systemTheme : next;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nothing changes on screen (e.g. "System" while the system already matches): just store the choice.
  if (reduce || !document.startViewTransition || root.classList.contains(resolved)) {
    setTheme(next);
    return;
  }

  const box = origin?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth / 2;
  const y = box ? box.top + box.height / 2 : 0;
  // Far enough to cover the farthest corner of the screen.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  // The page's own colour transitions would fade a second time inside the circle: hold them for the switch.
  const hold = document.createElement("style");
  hold.textContent = "*, *::before, *::after { transition: none !important; }";

  const transition = document.startViewTransition(() => {
    document.head.append(hold);
    // Applied here, synchronously, so the new snapshot has the new theme; next-themes then stores it.
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    setTheme(next);
  });

  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        // A full-screen change, seen rarely: longer than a control's 300ms, and ease-in-out because it grows
        // across the screen rather than popping in.
        { duration: 500, easing: "cubic-bezier(0.77, 0, 0.175, 1)", pseudoElement: "::view-transition-new(root)" },
      ),
    )
    .catch(() => undefined);
  transition.finished.finally(() => hold.remove()).catch(() => undefined);
}
