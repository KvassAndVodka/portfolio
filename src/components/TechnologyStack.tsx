"use client";

import type { IconType } from "react-icons";
import {
  SiDocker,
  SiFastapi,
  SiFfmpeg,
  SiFirebase,
  SiGreensock,
  SiIntel,
  SiLaravel,
  SiLinux,
  SiMaplibre,
  SiNextdotjs,
  SiNginx,
  SiOpenstreetmap,
  SiPostgresql,
  SiPytest,
  SiPython,
  SiReact,
  SiTypescript,
  SiVitest,
  SiWebgl,
} from "react-icons/si";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

import { LobeAntigravity, LobeCodex, SiClaudecode, SiOpencode } from "./aiIcons";

interface Capability {
  icon?: IconType;
  name: string;
}

interface PracticeArea {
  capabilities: Capability[];
  description: string;
  name: string;
}

// Grounded in active repositories since late 2025: an internal mapping platform, this portfolio, staRT, RT Transcript, Comspace.
const practiceAreas: PracticeArea[] = [
  {
    name: "Maps and spatial data",
    description:
      "Over months of work I reshaped a mapping platform into what it is today: a vector basemap on our own tiles served from Firebase, point-in-polygon checks against barangay boundaries, and road-graph routing.",
    capabilities: [
      { name: "MapLibre", icon: SiMaplibre },
      { name: "OpenStreetMap", icon: SiOpenstreetmap },
      { name: "WebGL", icon: SiWebgl },
      { name: "Firebase", icon: SiFirebase },
    ],
  },
  {
    name: "Product systems",
    description:
      "I shape interfaces, APIs, and data models together, from React field tools and this Next.js publishing system to a Laravel booking platform built to handle concurrent bookings safely.",
    capabilities: [
      { name: "TypeScript", icon: SiTypescript },
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "Laravel", icon: SiLaravel },
      { name: "GSAP", icon: SiGreensock },
    ],
  },
  {
    name: "Speech and applied AI",
    description:
      "I build local-first transcription services that turn live streams and broadcasts into speaker-attributed transcripts, and I have shipped computer-vision pipelines tuned for constrained hardware.",
    capabilities: [
      { name: "Python", icon: SiPython },
      { name: "FastAPI", icon: SiFastapi },
      { name: "FFmpeg", icon: SiFfmpeg },
      { name: "OpenVINO", icon: SiIntel },
    ],
  },
  {
    name: "AI-assisted workflow",
    description:
      "I build with AI-powered workflows day to day, pairing with Claude Code and OpenCode on real codebases, and I have worked with Codex and Antigravity.",
    capabilities: [
      { name: "Claude Code", icon: SiClaudecode },
      { name: "OpenCode", icon: SiOpencode },
      { name: "Codex", icon: LobeCodex },
      { name: "Antigravity", icon: LobeAntigravity },
    ],
  },
  {
    name: "Delivery and assurance",
    description:
      "I self-host what I ship in containers behind Nginx, and I keep it honest with tests at every layer, from pytest and Vitest to browser checks.",
    capabilities: [
      { name: "Docker", icon: SiDocker },
      { name: "Linux", icon: SiLinux },
      { name: "Nginx", icon: SiNginx },
      { name: "pytest", icon: SiPytest },
      { name: "Vitest", icon: SiVitest },
    ],
  },
];


// Everything with evidence in my repositories (an internal mapping platform, this portfolio, staRT, RT Transcript, Comspace,
// the plate-recognition pipeline from meldCX, BEMMRA, ML coursework), listed as plain text.
const toolkit: readonly Readonly<{ name: string; tools: readonly string[] }>[] = [
  {
    name: "Languages",
    tools: [
      "TypeScript", "JavaScript", "Python", "PHP", "C#", "Java", "C++", "C", "SQL", "Bash", "HTML", "CSS",
      "Assembly",
    ],
  },
  {
    name: "Frontend",
    tools: [
      "React", "Next.js", "Vite", "Tailwind CSS", "GSAP", "Framer Motion", "TanStack Query", "Zustand",
      "Mantine", "React Aria", "Recharts",
    ],
  },
  {
    name: "Maps and 3D",
    tools: [
      "MapLibre GL", "deck.gl", "OpenStreetMap", "PMTiles", "Planetiler", "tippecanoe", "Turf.js", "WebGL",
    ],
  },
  {
    name: "Backend and APIs",
    tools: [
      "Node.js", "FastAPI", "Laravel", "Prisma", "SQLAlchemy", "Alembic", "Auth.js", "Firebase", "Stripe",
      "WebSockets", "MQTT", ".NET Framework (WinForms)",
    ],
  },
  {
    name: "Data",
    tools: [
      "PostgreSQL", "SQLite", "Redis", "Firestore", "pandas", "NumPy", "Jupyter", "Kaggle",
    ],
  },
  {
    name: "AI, vision and speech",
    tools: [
      "YOLO (Ultralytics)", "PaddleOCR", "OpenVINO", "ONNX Runtime", "OpenCV", "BoxMOT", "faster-whisper",
      "pyannote.audio", "Hugging Face", "scikit-learn", "Tesseract.js", "FFmpeg", "yt-dlp",
    ],
  },
  {
    name: "AI coding tools",
    tools: [
      "Claude Code", "OpenCode", "Codex", "Antigravity",
    ],
  },
  {
    name: "Infrastructure",
    tools: [
      "Docker", "Docker Compose", "Linux", "Nginx", "GitHub Actions", "Cloudflare Tunnel", "Tailscale",
      "Git", "uv",
    ],
  },
  {
    name: "Testing and quality",
    tools: [
      "Vitest", "Playwright", "pytest", "Pest", "PHPUnit", "ESLint", "Prettier", "mypy", "axe-core",
      "SonarQube",
    ],
  },
];

const label = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";
const pad = (n: number) => String(n).padStart(2, "0");

const toolCount = toolkit.reduce((count, group) => count + group.tools.length, 0);

/**
 * "How I build" as a spec sheet a recruiter can scan: one card per practice area with recognisable tool
 * logos, then the full toolkit as plain text (findable with Ctrl+F). Cards rise in and their logos follow.
 */
export default function TechnologyStack() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      root.querySelectorAll<HTMLElement>("[data-area]").forEach((card, index) => {
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 88%", once: true } })
          .from(card, { y: 28, autoAlpha: 0, duration: 0.8, delay: (index % 3) * 0.08 })
          .from(card.querySelectorAll("[data-tool]"), { y: 10, autoAlpha: 0, stagger: 0.04, duration: 0.5 }, 0.25);
      });
      gsap.from(root.querySelectorAll("[data-ledger-row]"), {
        autoAlpha: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.6,
        scrollTrigger: { trigger: root.querySelector("[data-ledger]"), start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="technology-stage" aria-labelledby="technology-heading">
      <div className="site-shell">
        <div className="grid items-end gap-x-12 gap-y-5 lg:grid-cols-[auto_minmax(0,30rem)] lg:justify-between">
          <div>
            <h2 className="section-title" id="technology-heading">
              How I build.
            </h2>
            <p className={`${label} site-muted mt-4`}>
              <span className="text-[var(--accent)]">{pad(practiceAreas.length)}</span> areas ·{" "}
              <span className="text-[var(--accent)]">{toolCount}</span> tools, all used in real repositories
            </p>
          </div>
          <p className="body-large site-muted">
            The tools I reach for, grouped by the problem they help me solve. Each project page carries its full
            implementation stack.
          </p>
        </div>

        {/* The two widest practice areas lead; the other three share the second row. */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {practiceAreas.map((area, index) => (
            <article
              aria-labelledby={`area-${index}`}
              className={`${index < 2 ? "lg:col-span-3" : "lg:col-span-2"} flex flex-col rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)]`}
              data-area
              key={area.name}
            >
              <header className={`${label} flex h-11 items-stretch border-b border-[var(--line)]`}>
                <span className="flex items-center border-r-2 border-dashed border-[var(--postcard-tear)] px-5 text-[var(--postcard-rust)]">
                  {pad(index + 1)}
                </span>
                <h3 className="flex min-w-0 items-center truncate px-5" id={`area-${index}`}>
                  {area.name}
                </h3>
                <span className="ml-auto flex items-center whitespace-nowrap px-5 text-[var(--postcard-muted)]">
                  {pad(area.capabilities.length)} tools
                </span>
              </header>
              {/* Columns chosen so rows come out even; a lone last tool spans the row instead of leaving a gap. */}
              <ul
                className={`grid gap-px bg-[var(--line)] [&>li:last-child:nth-child(odd)]:col-span-2 ${
                  area.capabilities.length === 6
                    ? "grid-cols-2 sm:grid-cols-3 sm:[&>li:last-child:nth-child(odd)]:col-span-1"
                    : "grid-cols-2"
                }`}
              >
                {area.capabilities.map(({ icon: Icon, name }) => (
                  <li className="group flex items-center gap-3 bg-[var(--postcard-paper)] px-5 py-4" data-tool key={name}>
                    {Icon && (
                      <Icon
                        aria-hidden="true"
                        className="size-6 shrink-0 transition-colors duration-300 group-hover:text-[var(--postcard-orange)]"
                      />
                    )}
                    <span className="truncate font-semibold">{name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-[var(--line)] px-5 py-4 text-sm leading-[1.55] text-[var(--postcard-muted)]">
                {area.description}
              </p>
            </article>
          ))}
        </div>

        {/* Everything, in plain text: easy to scan, and findable with Ctrl+F. */}
        <div className="mt-16" data-ledger>
          <h3 className={`${label} border-b border-[var(--line-strong)] pb-3`}>
            Full toolkit · <span className="text-[var(--accent)]">{toolCount}</span>
          </h3>
          <dl>
            {toolkit.map((group) => (
              <div
                className="grid gap-x-10 gap-y-1 border-b border-[var(--line)] py-3.5 md:grid-cols-[14rem_minmax(0,1fr)]"
                data-ledger-row
                key={group.name}
              >
                <dt className={`${label} pt-0.5 text-[var(--accent)]`}>{group.name}</dt>
                <dd className="text-[0.9375rem] leading-[1.6]">{group.tools.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
