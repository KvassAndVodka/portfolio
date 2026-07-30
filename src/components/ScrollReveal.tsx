"use client";

import { m, type Variants } from "framer-motion";

import useSafeReveal from "@/hooks/useSafeReveal";

type ScrollRevealProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  variant?: "lift" | "clip" | "slide" | "stagger";
  delay?: number;
}>;

export default function ScrollReveal({ children, className = "", threshold = 0.12, variant = "lift", delay = 0 }: ScrollRevealProps) {
  const { ref, isRevealed, reduceMotion } = useSafeReveal<HTMLDivElement>({
    amount: threshold,
  });
  const easeOutExpo = [0.16, 1, 0.3, 1] as const;
  const variants: Record<NonNullable<ScrollRevealProps["variant"]>, Variants> = {
    lift: {
      hidden: { opacity: 0, y: 38 },
      visible: { opacity: 1, y: 0 },
    },
    clip: {
      hidden: { opacity: 0.35, clipPath: "inset(0 0 100% 0)", y: 18 },
      visible: { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 },
    },
    slide: {
      hidden: { opacity: 0, x: -52, skewX: -1.5 },
      visible: { opacity: 1, x: 0, skewX: 0 },
    },
    stagger: {
      hidden: { opacity: 0, scale: 0.985 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  return (
    <m.div
      className={`reveal ${className}`}
      ref={ref}
      variants={variants[variant]}
      initial={reduceMotion ? false : "hidden"}
      animate={isRevealed ? "visible" : "hidden"}
      transition={{
        duration: reduceMotion ? 0 : variant === "clip" ? 0.9 : 0.76,
        delay: reduceMotion ? 0 : delay / 1000,
        ease: easeOutExpo,
      }}
    >
      {children}
    </m.div>
  );
}
