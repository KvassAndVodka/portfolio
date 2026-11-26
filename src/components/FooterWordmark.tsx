"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const WORDMARK = "Javier Raut";
const WORDMARK_GLYPHS = Array.from(WORDMARK, (char, position) => ({
  id: char === " " ? `space-${position}` : `char-${position}-${char}`,
  char,
}));

/**
 * The footer's sign-off. When the footer enters view, a survey datum and coordinate beam sweep across
 * the baseline: each glyph plots in hollow vector wireframe first, fills upward with solid ink, and
 * locks with the orange coordinate dot. Readable immediately without JavaScript or motion.
 */
export default function FooterWordmark() {
  const ref = useRef<HTMLParagraphElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;

      gsap.set(".wordmark-wire", { clipPath: "inset(0 100% 0 0)", opacity: 0 });
      gsap.set(".wordmark-ink", { clipPath: "inset(100% 0 0 0)" });
      gsap.set(".wordmark-tick", { opacity: 0, scale: 0.6 });
      gsap.set(".wordmark-datum", { scaleX: 0, opacity: 0 });
      gsap.set(".wordmark-beam", { x: 0, opacity: 0 });
      gsap.set(".wordmark-coords", { opacity: 0 });
      gsap.set(".site-footer-dot", { scale: 0, opacity: 0, transformOrigin: "50% 85%" });
      gsap.set(".wordmark-ping", { scale: 0.25, opacity: 0 });

      const survey = { arcMinutes: 38 * 60 };
      const updateCoords = () => {
        if (!coordsRef.current) return;
        const totalSeconds = Math.round(survey.arcMinutes);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        coordsRef.current.textContent = `PLOT · N 08°29′00″ E 124°${String(mins).padStart(2, "0")}′${String(secs).padStart(2, "0")}″`;
      };

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root.closest("footer"), start: "top 90%", once: true },
      });

      timeline
        // 1. Survey sweep: datum line, vertical beam, and ticking coordinates scan across the wordmark.
        .to(".wordmark-datum", { opacity: 0.85, duration: 0.14, ease: "none" }, 0)
        .to(".wordmark-datum", { scaleX: 1, duration: 0.95, ease: "power2.inOut" }, 0)
        .to(".wordmark-beam", { opacity: 1, duration: 0.12, ease: "none" }, 0)
        .to(".wordmark-beam", { x: () => root.offsetWidth, duration: 0.98, ease: "power2.inOut" }, 0)
        .to(".wordmark-beam", { opacity: 0, duration: 0.2, ease: "none" }, 0.9)
        .to(".wordmark-coords", { opacity: 1, duration: 0.18, ease: "none" }, 0)
        .to(survey, { arcMinutes: 41 * 60, duration: 0.98, ease: "power2.inOut", onUpdate: updateCoords }, 0)
        .to(".wordmark-coords", { opacity: 0, duration: 0.3, ease: "power2.in" }, 1.2)
        // 2. Vector wireframe & registration ticks plot each letter before solid ink fills upward.
        .to(".wordmark-tick", { opacity: 0.9, scale: 1, stagger: 0.065, duration: 0.16, ease: "power2.out" }, 0.06)
        .to(".wordmark-tick", { opacity: 0, stagger: 0.065, duration: 0.35, ease: "power2.in" }, 0.42)
        .to(".wordmark-wire", { clipPath: "inset(0 0% 0 0)", opacity: 1, stagger: 0.065, duration: 0.34, ease: "power2.out" }, 0.08)
        .to(".wordmark-wire", { opacity: 0, stagger: 0.065, duration: 0.38, ease: "power2.in" }, 0.56)
        .to(".wordmark-ink", { clipPath: "inset(0% 0 0 0)", stagger: 0.065, duration: 0.52, ease: "power3.out", clearProps: "clipPath" }, 0.24)
        // 3. Coordinate pin lock: orange full stop stamps in with a survey ring as the datum clears.
        .to(".site-footer-dot", { scale: 1, opacity: 1, duration: 0.42, ease: "outExpo", clearProps: "transform,opacity" }, 0.96)
        .fromTo(".wordmark-ping", { scale: 0.25, opacity: 0.9 }, { scale: 2.8, opacity: 0, duration: 0.75, ease: "power2.out" }, 0.96)
        .to(".wordmark-datum", { opacity: 0, duration: 0.42, ease: "power2.out" }, 1.04);
    },
    { scope: ref },
  );

  return (
    <p className="site-footer-wordmark" ref={ref} aria-hidden="true">
      <span className="wordmark-coords" ref={coordsRef}>
        PLOT · N 08°29′00″ E 124°38′00″
      </span>
      <span className="wordmark-datum" />
      <span className="wordmark-beam" />
      <span className="site-footer-name">
        {WORDMARK_GLYPHS.map((glyph) =>
          glyph.char === " " ? (
            <span className="wordmark-space" key={glyph.id}>
              {"\u00A0"}
            </span>
          ) : (
            <span className="wordmark-glyph" key={glyph.id}>
              <span className="wordmark-ink">{glyph.char}</span>
              <span className="wordmark-wire">{glyph.char}</span>
              <span className="wordmark-tick">+</span>
            </span>
          ),
        )}
      </span>
      <span className="site-footer-dot">
        .<span className="wordmark-ping" />
      </span>
    </p>
  );
}
