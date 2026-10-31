"use client";

import useScrollReveal from "@/hooks/useScrollReveal";

type ScrollRevealProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  variant?: "lift" | "clip" | "slide" | "stagger";
  delay?: number;
}>;

const variants: Record<NonNullable<ScrollRevealProps["variant"]>, gsap.TweenVars> = {
  lift: { autoAlpha: 0, y: 38 },
  clip: { autoAlpha: 0.35, clipPath: "inset(0 0 100% 0)", y: 18, duration: 0.9 },
  slide: { autoAlpha: 0, x: -52, skewX: -1.5 },
  stagger: { autoAlpha: 0, scale: 0.985 },
};

export default function ScrollReveal({ children, className = "", variant = "lift", delay = 0 }: ScrollRevealProps) {
  const ref = useScrollReveal<HTMLDivElement>({ from: variants[variant], delay: delay / 1000 });

  return (
    <div className={`reveal ${className}`} ref={ref}>
      {children}
    </div>
  );
}
