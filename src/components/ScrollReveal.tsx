"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export default function ScrollReveal({ children, className = "", threshold = 0.1 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: threshold,
        rootMargin: "0px 0px 200px 0px"
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} transition-opacity duration-1000 ${
        isVisible ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
}
