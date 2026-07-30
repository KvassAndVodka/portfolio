"use client";

import { m, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.35,
  });

  if (pathname?.startsWith("/admin")) return null;

  return <m.div aria-hidden="true" className="scroll-progress" style={{ scaleX }} />;
}
