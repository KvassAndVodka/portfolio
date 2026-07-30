"use client";

import { m } from "framer-motion";

import useSafeReveal from "@/hooks/useSafeReveal";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

export type ExperienceEntry = Readonly<{
  current?: boolean;
  detail: string;
  organization: string;
  period: string;
  role: string;
  url?: string;
}>;

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export default function ExperienceTimeline({
  entries,
}: Readonly<{ entries: readonly ExperienceEntry[] }>) {
  const { ref, isRevealed, reduceMotion } = useSafeReveal<HTMLDivElement>();

  return (
    <m.div
      className="experience-list"
      ref={ref}
      initial={reduceMotion ? false : "hidden"}
      animate={isRevealed ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.14 } },
      }}
    >
      {entries.map((item, index) => (
        <m.article
          className={`experience-item${item.current ? " experience-item-current" : ""}`}
          key={`${item.period}-${item.role}`}
          custom={index}
          variants={{
            hidden: (itemIndex: number) => ({
              opacity: 0,
              x: itemIndex % 2 === 0 ? 42 : 72,
            }),
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.76, ease: easeOutExpo },
            },
          }}
        >
          <div className="experience-period">
            <time>{item.period}</time>
            {item.current && <span>Current role</span>}
          </div>
          <div>
            <h3>{item.role}</h3>
            {item.url ? (
              <a
                className="experience-organization experience-organization-link"
                href={item.url}
                rel="noreferrer"
                target="_blank"
              >
                {item.organization}
                <FaArrowUpRightFromSquare aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="experience-organization">{item.organization}</p>
            )}
            <p className="experience-detail">{item.detail}</p>
          </div>
        </m.article>
      ))}
    </m.div>
  );
}
