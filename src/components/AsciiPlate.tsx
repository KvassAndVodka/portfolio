"use client";

import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

// The same glyph ramp as the cloud shader (sparse to dense), so plates read as part of the cloud.
const GLYPHS = ".,:;-=+*#%@";

/** Density (0-1) of one cell: a wide oval filled with one of four patterns, picked by `pattern`. */
function density(pattern: number, col: number, row: number, cols: number, rows: number) {
  const x = (col - cols / 2 + 0.5) / (cols * 0.42);
  const y = (row - rows / 2 + 0.5) / (rows / 2);
  const r = Math.hypot(x, y);
  if (r > 1) return 0;
  const edge = Math.min(1, (1 - r) * 5); // soft rim
  const fill = [
    0.5 + 0.5 * Math.sin(x * 20), // stripes
    0.5 + 0.5 * Math.cos(r * 16), // rings
    0.5 + 0.5 * Math.sin((x * 2.2 + y) * 6), // hatching
    [1, 0.55, 0.8, 0.35][(x >= 0 ? 1 : 0) + (y >= 0 ? 2 : 0)], // quarters
  ][pattern % 4];
  return fill * edge;
}

/** The finished plate as rows of glyphs. Exported for the self-check in tests. */
export function plateText(pattern: number, cols: number, rows: number) {
  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      const d = density(pattern, col, row, cols, rows);
      line += d < 0.06 ? " " : GLYPHS[Math.round(d * (GLYPHS.length - 1))];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

type AsciiPlateProps = Readonly<{
  pattern: number;
  /** Develop out of noise when this turns true; otherwise show the finished plate. */
  run?: boolean;
  cols?: number;
  rows?: number;
  className?: string;
  color?: string;
}>;

/**
 * A project's mark drawn in the cloud's ASCII: the stand-in picture until a project has a screenshot.
 * When `run` turns on it develops out of noise, then a few cells keep flickering like the live cloud.
 * Decorative only (aria-hidden); the finished plate is server-rendered so it shows without JavaScript.
 */
export default function AsciiPlate({ pattern, run = false, cols = 76, rows = 38, className = "", color }: AsciiPlateProps) {
  const ref = useRef<HTMLPreElement>(null);
  const finished = plateText(pattern, cols, rows);

  useEffect(() => {
    const pre = ref.current;
    if (!pre || !run || prefersReducedMotion()) return;
    const target = finished.split("");
    const thresholds = target.map(() => Math.random());
    const noise = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
    const state = { progress: 0 };
    const develop = gsap.to(state, {
      progress: 1,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        pre.textContent = target
          .map((char, i) => (char === "\n" || thresholds[i] < state.progress ? char : char === " " && Math.random() > 0.15 ? " " : noise()))
          .join("");
      },
    });
    const shimmer = window.setInterval(() => {
      if (develop.isActive()) return;
      const chars = target.slice();
      for (let n = 0; n < 40; n++) {
        const i = (Math.random() * chars.length) | 0;
        const g = GLYPHS.indexOf(chars[i]);
        if (g >= 0) chars[i] = GLYPHS[Math.min(g + 1, GLYPHS.length - 1)];
      }
      pre.textContent = chars.join("");
    }, 160);
    return () => {
      develop.kill();
      window.clearInterval(shimmer);
      pre.textContent = finished;
    };
  }, [finished, run]);

  return (
    <pre ref={ref} aria-hidden="true" className={`w-fit select-none font-mono leading-[1.05] ${className}`} style={color ? { color } : undefined}>
      {finished}
    </pre>
  );
}
