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

import useScrollReveal from "@/hooks/useScrollReveal";

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

// Grounded in active repositories since late 2025: CEMAP, this portfolio, staRT, RT Transcript, Comspace.
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


// Everything with evidence in my repositories (CEMAP, this portfolio, staRT, RT Transcript, Comspace,
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

const toolCount = toolkit.reduce((count, group) => count + group.tools.length, 0);

export default function TechnologyStack() {
  const headingRef = useScrollReveal<HTMLDivElement>({
    from: { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", y: 22, duration: 0.92 },
    start: "top 80%",
  });
  const areasRef = useScrollReveal<HTMLOListElement>({
    targets: ".stack-area",
    from: { autoAlpha: 0, y: 24 },
    stagger: 0.08,
  });

  return (
    <section className="technology-stage" aria-labelledby="technology-heading">
      <div className="site-shell">
        <div className="stack-heading" ref={headingRef}>
          <h2 className="section-title" id="technology-heading">
            How I build.
          </h2>
          <p className="body-large">
            The tools I reach for, grouped by the problem they help me solve. Each project page carries its
            full implementation stack.
          </p>
        </div>

        {/* One row per practice area, read across like a spec sheet: number and name, what I do, the tools. */}
        <ol className="stack-areas" ref={areasRef}>
          {practiceAreas.map((area, index) => (
            <li className="stack-area" key={area.name}>
              <p className="stack-index">{String(index + 1).padStart(2, "0")}</p>
              <h3>{area.name}</h3>
              <p className="stack-description">{area.description}</p>
              <ul className="stack-tools">
                {area.capabilities.map(({ icon: Icon, name }) => (
                  <li key={name}>
                    {Icon && <Icon aria-hidden="true" />}
                    {name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        {/* The full list stays one click away instead of a wall of tags: one plain line per category. */}
        <details className="stack-toolkit">
          <summary>
            Full toolkit <span>{toolCount}</span>
          </summary>
          <dl>
            {toolkit.map((group) => (
              <div key={group.name}>
                <dt>{group.name}</dt>
                <dd>{group.tools.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
