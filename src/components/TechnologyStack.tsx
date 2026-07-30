"use client";

import { m } from "framer-motion";
import type { IconType } from "react-icons";
import {
  SiDotnet,
  SiDocker,
  SiFfmpeg,
  SiHuggingface,
  SiLinux,
  SiNginx,
  SiNextdotjs,
  SiPostgresql,
  SiPython,
  SiSonarqubeserver,
  SiTypescript,
  SiIntel,
} from "react-icons/si";

import useSafeReveal from "@/hooks/useSafeReveal";

interface Capability {
  icon: IconType;
  name: string;
}

interface PracticeArea {
  capabilities: Capability[];
  description: string;
  name: string;
}

const practiceAreas: PracticeArea[] = [
  {
    name: "Product systems",
    description:
      "I shape interfaces, APIs, and relational models together—from this publishing system to the internal tools I maintain at the House.",
    capabilities: [
      { name: "TypeScript", icon: SiTypescript },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: ".NET", icon: SiDotnet },
    ],
  },
  {
    name: "Delivery and assurance",
    description:
      "I containerize production services, design private service networks, and use static analysis and deployment guards to harden what ships.",
    capabilities: [
      { name: "Docker", icon: SiDocker },
      { name: "Linux", icon: SiLinux },
      { name: "Nginx", icon: SiNginx },
      { name: "SonarQube", icon: SiSonarqubeserver },
    ],
  },
  {
    name: "Applied AI and media",
    description:
      "I build transcription, computer-vision, and dynamic-network research pipelines, then tune them around accuracy, recovery, and constrained hardware.",
    capabilities: [
      { name: "Python", icon: SiPython },
      { name: "FFmpeg", icon: SiFfmpeg },
      { name: "Hugging Face", icon: SiHuggingface },
      { name: "OpenVINO", icon: SiIntel },
    ],
  },
];

export default function TechnologyStack() {
  const {
    ref: headingRef,
    isRevealed: isHeadingRevealed,
    reduceMotion,
  } = useSafeReveal<HTMLDivElement>({ amount: 0.5 });
  const {
    ref: groupsRef,
    isRevealed: areGroupsRevealed,
  } = useSafeReveal<HTMLDivElement>();

  return (
    <section className="technology-stage" aria-labelledby="technology-heading">
      <div className="site-shell">
        <m.div
          className="technology-heading"
          ref={headingRef}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 22 }
          }
          animate={
            isHeadingRevealed
              ? { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 }
              : { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 22 }
          }
          transition={{ duration: reduceMotion ? 0 : 0.92, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="section-title" id="technology-heading">
            How I build.
          </h2>
          <p className="body-large">
            A focused view of the tools I reach for, grouped by the problem they help me solve.
            Each project page carries the full implementation stack.
          </p>
        </m.div>

        <m.div
          className="technology-groups"
          ref={groupsRef}
          initial={reduceMotion ? false : "hidden"}
          animate={areGroupsRevealed ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.16 } },
          }}
        >
          {practiceAreas.map((area) => (
            <m.article
              className="technology-group"
              key={area.name}
              variants={{
                hidden: { opacity: 0, x: -44, clipPath: "inset(0 0 30% 0)" },
                visible: {
                  opacity: 1,
                  x: 0,
                  clipPath: "inset(0 0 0% 0)",
                  transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <h3>{area.name}</h3>
              <p>{area.description}</p>
              <ul>
                {area.capabilities.map(({ icon: Icon, name }) => (
                  <m.li
                    key={name}
                    whileHover={reduceMotion ? undefined : { x: 5 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  >
                    <Icon aria-hidden="true" />
                    <span>{name}</span>
                  </m.li>
                ))}
              </ul>
            </m.article>
          ))}
        </m.div>
      </div>
    </section>
  );
}
