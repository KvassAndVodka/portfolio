"use client";

import { m, useReducedMotion } from "framer-motion";
import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const reduceMotion = useReducedMotion();

  if (isAdmin) {
    return (
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    );
  }

  return (
    <m.main
      key={pathname}
      id="main-content"
      tabIndex={-1}
      initial={reduceMotion ? false : { opacity: 0.86, transform: "translateY(4px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </m.main>
  );
}
