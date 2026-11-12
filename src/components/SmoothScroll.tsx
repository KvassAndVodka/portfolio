"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

// The story steers the wheel itself while it plays (see StoryJourney). It registers a test here, and
// Lenis leaves alone any wheel input the story claims, so the two never fight over the scroll.
let claim: ((deltaY: number) => boolean) | null = null;

export function claimWheel(test: ((deltaY: number) => boolean) | null) {
  claim = test;
}

/** Smooth wheel scrolling for the whole site, driven by GSAP's ticker so ScrollTrigger stays in step. */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
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

  return null;
}
