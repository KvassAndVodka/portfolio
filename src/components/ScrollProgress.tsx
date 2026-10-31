"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

export default function ScrollProgress() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = pathname?.startsWith("/admin");

  useGSAP(
    () => {
      if (isAdmin) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );
    },
    { dependencies: [pathname, isAdmin] },
  );

  if (isAdmin) return null;

  return <div aria-hidden="true" className="scroll-progress" ref={ref} />;
}
