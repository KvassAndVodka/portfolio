"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** The halftone prints in from the left, like a sheet coming off the press. One clip tween, not one per dot: thousands of dot tweens froze the desk for over a second. */
export default function DotsReveal({ children, className = "" }: Readonly<{ children: React.ReactNode; className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(ref.current, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power2.out", clearProps: "clipPath" });
    },
    { scope: ref },
  );
  return <div ref={ref} className={className}>{children}</div>;
}
