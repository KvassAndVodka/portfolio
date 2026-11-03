"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";

/**
 * The footer's sign-off. When it scrolls into view the letters rise out of the page's bottom edge one by
 * one, then the orange dot drops in last, like a pin landing on the map. Readable without the motion.
 */
export default function FooterWordmark() {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create(".site-footer-name", { type: "chars" });
      gsap
        // Triggered by the footer, not the wordmark: on phones the wordmark sits so near the page's end that
        // its own top never climbs far enough up the screen to start anything, and the name stayed hidden.
        .timeline({ scrollTrigger: { trigger: ref.current!.closest("footer"), start: "top 75%", once: true } })
        .from(split.chars, { yPercent: 110, duration: 0.9, stagger: 0.045, ease: "power4.out" })
        .from(".site-footer-dot", { yPercent: -260, autoAlpha: 0, duration: 0.7, ease: "bounce.out" }, "-=0.35");
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <p className="site-footer-wordmark" ref={ref} aria-hidden="true">
      <span className="site-footer-name">Javier Raut</span>
      <span className="site-footer-dot">.</span>
    </p>
  );
}
