"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

import useReducedMotion from "@/hooks/useReducedMotion";
import { gsap, useGSAP } from "@/lib/gsap";

export default function ScrollProgress() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = pathname?.startsWith("/admin");
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (isAdmin || reducedMotion) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );
    },
    { dependencies: [pathname, isAdmin, reducedMotion] },
  );

  if (isAdmin || reducedMotion) return null;

  return <div aria-hidden="true" className="scroll-progress" ref={ref} />;
}
