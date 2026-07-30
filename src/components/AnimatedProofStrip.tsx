"use client";

import { m } from "framer-motion";

import useSafeReveal from "@/hooks/useSafeReveal";

type ProofPoint = Readonly<{
  href?: string;
  label: string;
  value: string;
}>;

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export default function AnimatedProofStrip({ points }: Readonly<{ points: readonly ProofPoint[] }>) {
  const { ref, isRevealed, reduceMotion } = useSafeReveal<HTMLDListElement>({
    amount: 0.55,
  });

  return (
    <section className="proof-band" aria-label="Quick profile">
      <m.dl
        className="proof-strip site-shell"
        ref={ref}
        initial={reduceMotion ? false : "hidden"}
        animate={isRevealed ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.14 } },
        }}
      >
        {points.map((point) => (
          <m.div
            key={point.label}
            variants={{
              hidden: { opacity: 0, y: 24, clipPath: "inset(0 0 35% 0)" },
              visible: {
                opacity: 1,
                y: 0,
                clipPath: "inset(0 0 0% 0)",
                transition: { duration: 0.72, ease: easeOutExpo },
              },
            }}
          >
            <dt>{point.label}</dt>
            <dd>
              {point.href ? (
                <a href={point.href} rel="noreferrer" target="_blank">
                  {point.value}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                point.value
              )}
            </dd>
          </m.div>
        ))}
      </m.dl>
    </section>
  );
}
