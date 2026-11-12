"use client";

import { useMemo, useRef } from "react";

import { contourLevels, type Hill } from "@/lib/contours";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type Levels = ReturnType<typeof contourLevels>;

type Layout = Readonly<{
  viewBox: string;
  preserve: string;
  tear: string;
  route: string;
  end: string;
  hills: Hill[];
  size: { width: number; height: number; cell: number; step: number };
  scale: number;
}>;

// Wide screens: the tear runs top to bottom and the sheet fills the right side of the page.
const WIDE_TEAR = "M820 -10l-14 60 18 50-16 70 20 60-18 80 16 60-20 90 18 70-14 80 18 60-16 90 12 80";
const WIDE: Layout = {
  viewBox: "0 0 1440 900",
  preserve: "xMinYMid slice",
  tear: WIDE_TEAR,
  route: "M1380 860 C 1300 760, 1180 760, 1120 650 S 1000 470, 940 420 S 860 330, 800 320 S 730 318, 690 330",
  end: "M676 316l28 28M704 316l-28 28",
  hills: [
    { x: 1080, y: 360, height: 260, spread: 120, stretch: 1.5 },
    { x: 1300, y: 700, height: 180, spread: 100 },
    { x: 900, y: 760, height: 110, spread: 80, stretch: 0.8 },
  ],
  size: { width: 1500, height: 920, cell: 10, step: 14 },
  scale: 1,
};

// Phones and portrait screens: the sheet fills the top of the page and tears along its bottom edge.
const TALL: Layout = {
  viewBox: "0 0 390 360",
  preserve: "xMidYMax slice",
  tear: "M-10 296l40-10 36 12 44-14 40 10 46-12 38 14 44-10 40 12 42-8 40 6",
  route: "M372 -10 C 350 60, 290 80, 250 130 S 210 230, 160 270 S 90 320, 60 344",
  end: "M50 334l20 20M70 334l-20 20",
  hills: [
    { x: 230, y: 120, height: 240, spread: 70, stretch: 1.5 },
    { x: 70, y: 230, height: 150, spread: 50 },
    { x: 360, y: 260, height: 110, spread: 45 },
  ],
  size: { width: 400, height: 320, cell: 5, step: 14 },
  scale: 0.8,
};

function Sheet({ id, className, layout, terrain }: Readonly<{ id: string; className: string; layout: Layout; terrain: Levels }>) {
  const { viewBox, preserve, tear, route, end, scale } = layout;
  // The sheet is everything on the far side of the tear.
  const sheet = id === "wide" ? `${tear}L1500 910L1500 -10Z` : `${tear}L400 -10L-10 -10Z`;

  return (
    <svg className={`pointer-events-none ${className}`} viewBox={viewBox} preserveAspectRatio={preserve} aria-hidden="true">
      <defs>
        <clipPath id={`torn-sheet-${id}`}>
          <path d={sheet} />
        </clipPath>
        <mask id={`torn-route-${id}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="1540" height="960">
          <path className="torn-route-reveal" d={route} pathLength={1} strokeDasharray="1" fill="none" stroke="#fff" strokeWidth={14 * scale} />
        </mask>
      </defs>
      <path d={sheet} fill="var(--surface)" opacity={0.55} />
      <g clipPath={`url(#torn-sheet-${id})`} fill="none" stroke="var(--muted)" opacity={0.55}>
        {terrain.map((level) => (
          <path key={level.elevation} className="torn-contour" d={level.d} pathLength={1} strokeDasharray="1" strokeWidth={(level.index ? 2.2 : 1.1) * scale} />
        ))}
      </g>
      <path className="torn-edge" d={tear} fill="none" stroke="var(--foreground)" strokeWidth={1.6 * scale} strokeDasharray="6 10" />
      {/* The dotted route is revealed by a solid copy in a mask, so it draws in without losing its dots. */}
      <path d={route} mask={`url(#torn-route-${id})`} fill="none" stroke="var(--foreground)" strokeWidth={3 * scale} strokeLinecap="round" strokeDasharray={scale < 1 ? "2 9" : "2 12"} />
      <path className="torn-end" d={end} stroke="var(--accent)" strokeWidth={5 * scale} strokeLinecap="round" />
    </svg>
  );
}

/** A contour map torn along the header's tear line; a route walks off it and stops at an ×. Decorative. */
export default function TornMap() {
  const root = useRef<HTMLDivElement>(null);
  const wide = useMemo(() => contourLevels(WIDE.hills, WIDE.size), []);
  const tall = useMemo(() => contourLevels(TALL.hills, TALL.size), []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Marching squares emit segments row by row, so drawing each level in reads as a survey scan.
      gsap.fromTo(".torn-contour", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", stagger: 0.04 });
      gsap.fromTo(".torn-edge", { strokeDashoffset: 0 }, { strokeDashoffset: -16, duration: 1.6, ease: "none", repeat: -1 });
      gsap.fromTo(".torn-route-reveal", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, delay: 0.8, ease: "power1.inOut" });
      gsap.fromTo(".torn-end", { scale: 0, rotate: -45, transformOrigin: "50% 50%" }, { scale: 1, rotate: 0, duration: 0.5, delay: 3.3, ease: "back.out(3)" });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="contents">
      <Sheet id="wide" className="absolute inset-0 hidden h-full w-full md:landscape:block" layout={WIDE} terrain={wide} />
      <Sheet id="tall" className="absolute inset-x-0 top-0 h-[min(92vw,56svh)] w-full md:landscape:hidden" layout={TALL} terrain={tall} />
    </div>
  );
}
