"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type RevealOptions = Readonly<{
  /** Animate these descendants (with a stagger) instead of the element itself. */
  targets?: string;
  from: gsap.TweenVars;
  stagger?: number;
  delay?: number;
  duration?: number;
  start?: string;
}>;

/**
 * Reveals an element once it scrolls into view. Content is visible by default,
 * so it stays readable without JavaScript or with reduced motion.
 */
export default function useScrollReveal<T extends HTMLElement>({
  targets,
  from,
  stagger = 0,
  delay = 0,
  duration,
  start = "top 86%",
}: RevealOptions) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || prefersReducedMotion()) return;

      gsap.from(targets ? element.querySelectorAll(targets) : element, {
        ...from,
        stagger,
        delay,
        ...(duration ? { duration } : {}),
        scrollTrigger: { trigger: element, start, once: true },
      });
    },
    { scope: ref },
  );

  return ref;
}
