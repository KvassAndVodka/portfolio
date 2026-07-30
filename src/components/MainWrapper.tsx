"use client";

import { m, useReducedMotion } from "framer-motion";
import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const reduceMotion = useReducedMotion();

  return (
    <m.main
      key={pathname}
      id="main-content"
      className={isAdmin ? "" : "pt-[4.5rem]"}
      tabIndex={-1}
      initial={reduceMotion || isAdmin ? false : { opacity: 0.55, clipPath: "inset(0 0 1.5rem 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0 0 0rem 0)" }}
      transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.main>
  );
}
