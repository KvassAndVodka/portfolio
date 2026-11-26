"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/lenis";

// The story steers the wheel itself while it plays (see StoryJourney). It registers a test here, and
// Lenis leaves alone any wheel input the story claims, so the two never fight over the scroll.
let claim: ((deltaY: number) => boolean) | null = null;

export function claimWheel(test: ((deltaY: number) => boolean) | null) {
  claim = test;
}

/** Smooth wheel scrolling for the whole site, driven by GSAP's ticker so ScrollTrigger stays in step. */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 72;
    const lenis = new Lenis({
      autoRaf: false,
      anchors: { offset: -(headerHeight + 24) },
      stopInertiaOnNavigate: true,
      virtualScroll: ({ deltaY, event }) => !(event instanceof WheelEvent && claim?.(deltaY)),
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    setLenis(lenis);

    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  // Keep cross-route hash arrivals (e.g. /projects -> /#contact) aligned after pinned triggers mount.
  useEffect(() => {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash === "#") return;

    let id = "";
    try {
      id = decodeURIComponent(rawHash.slice(1));
    } catch {
      return;
    }
    if (!id) return;

    let stopped = false;
    let raf1 = 0;
    let raf2 = 0;
    let settleTimer = 0;

    const alignToHash = () => {
      if (stopped) return;
      const target = document.getElementById(id);
      if (!target) return;
      const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 72;
      const offset = -(headerHeight + 24);
      const lenis = getLenis();

      if (lenis) {
        lenis.resize();
        lenis.scrollTo(target, { offset, immediate: true });
      } else {
        const root = document.documentElement;
        root.style.scrollBehavior = "auto";
        window.scrollTo({
          top: Math.max(0, target.getBoundingClientRect().top + window.scrollY + offset),
          behavior: "instant",
        });
        root.style.scrollBehavior = "";
      }
      ScrollTrigger.update();
    };

    const stopWatching = () => {
      if (stopped) return;
      stopped = true;
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(settleTimer);
      ScrollTrigger.removeEventListener("refresh", alignToHash);
      window.removeEventListener("wheel", stopWatching);
      window.removeEventListener("touchstart", stopWatching);
      window.removeEventListener("pointerdown", stopWatching);
      window.removeEventListener("keydown", stopWatching);
    };

    raf1 = window.requestAnimationFrame(() => {
      alignToHash();
      raf2 = window.requestAnimationFrame(alignToHash);
    });
    ScrollTrigger.addEventListener("refresh", alignToHash);
    window.addEventListener("wheel", stopWatching, { passive: true, once: true });
    window.addEventListener("touchstart", stopWatching, { passive: true, once: true });
    window.addEventListener("pointerdown", stopWatching, { passive: true, once: true });
    window.addEventListener("keydown", stopWatching, { passive: true, once: true });
    settleTimer = window.setTimeout(stopWatching, 2_000);

    return stopWatching;
  }, [pathname]);

  return null;
}
