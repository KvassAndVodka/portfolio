"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Halftone dots ([data-dot]) grow in from the left, like a sheet coming off the press. */
export default function DotsReveal({ children, className = "" }: Readonly<{ children: React.ReactNode; className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-dot]", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: { amount: 1.2, from: "start", axis: "x", grid: "auto" }, ease: "back.out(2)" });
    },
    { scope: ref },
  );
  return <div ref={ref} className={className}>{children}</div>;
}
