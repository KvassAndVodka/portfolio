"use client";

import { usePathname } from 'next/navigation';
import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export default function MainWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isAdmin || prefersReducedMotion()) return;
      gsap.from(ref.current, { autoAlpha: 0.86, y: 4, duration: 0.18, clearProps: "transform" });
    },
    { dependencies: [pathname, isAdmin] },
  );

  return (
    <main id="main-content" tabIndex={-1} ref={ref}>
      {children}
    </main>
  );
}
