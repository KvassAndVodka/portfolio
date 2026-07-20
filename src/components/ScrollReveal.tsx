"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  variant?: "lift" | "clip" | "slide" | "stagger";
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  threshold = 0.12,
  variant = "lift",
  delay = 0,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!element || reduceMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px 120px 0px" },
    );

    observer.observe(element);
    const fallback = window.setTimeout(() => setIsVisible(true), 1_500);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-visible={isVisible}
      data-variant={variant}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
