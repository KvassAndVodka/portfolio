"use client";

import type { IconType } from "react-icons";
import {
  SiC,
  SiCloudflare,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiDotnet,
  SiEslint,
  SiFastapi,
  SiFfmpeg,
  SiFirebase,
  SiFramer,
  SiGit,
  SiGithubactions,
  SiGnubash,
  SiGreensock,
  SiHtml5,
  SiHuggingface,
  SiIntel,
  SiJavascript,
  SiJupyter,
  SiKaggle,
  SiLaravel,
  SiLinux,
  SiMantine,
  SiMaplibre,
  SiMqtt,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiNumpy,
  SiOnnx,
  SiOpencv,
  SiOpenjdk,
  SiOpenstreetmap,
  SiPaddlepaddle,
  SiPandas,
  SiPhp,
  SiPostgresql,
  SiPrettier,
  SiPrisma,
  SiPytest,
  SiPython,
  SiReact,
  SiReactquery,
  SiRedis,
  SiScikitlearn,
  SiSharp,
  SiSonarqubeserver,
  SiSqlalchemy,
  SiSqlite,
  SiStripe,
  SiTailscale,
  SiTailwindcss,
  SiTypescript,
  SiUltralytics,
  SiUv,
  SiVite,
  SiVitest,
  SiWebgl,
  SiYoutube,
} from "react-icons/si";

import useScrollReveal from "@/hooks/useScrollReveal";

interface Capability {
  icon: IconType;
  name: string;
}

interface PracticeArea {
  capabilities: Capability[];
  description: string;
  name: string;
}

// Grounded in active repositories since late 2025: eMap, this portfolio, staRT, RT Transcript, Comspace.
const practiceAreas: PracticeArea[] = [
  {
    name: "Maps and spatial data",
    description:
      "I build the House's eMap: a self-hosted vector basemap, point-in-polygon checks against barangay boundaries, road-graph routing on our own tiles, and in-browser BIM models.",
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

type Tool = Readonly<{ name: string; icon?: IconType }>;

// Everything with evidence in my repositories (eMap, this portfolio, staRT, RT Transcript, Comspace,
// the plate-recognition pipeline from meldCX, BEMMRA, ML coursework). Tools without a brand icon show
// as text only.
const toolkit: readonly Readonly<{ name: string; tools: readonly Tool[] }>[] = [
  {
    name: "Languages",
    tools: [
      { name: "TypeScript", icon: SiTypescript },
      { name: "JavaScript", icon: SiJavascript },
      { name: "Python", icon: SiPython },
      { name: "PHP", icon: SiPhp },
      { name: "C#", icon: SiSharp },
      { name: "Java", icon: SiOpenjdk },
      { name: "C++", icon: SiCplusplus },
      { name: "C", icon: SiC },
      { name: "SQL" },
      { name: "Bash", icon: SiGnubash },
      { name: "HTML", icon: SiHtml5 },
      { name: "CSS", icon: SiCss },
      { name: "Assembly" },
    ],
  },
  {
    name: "Frontend",
    tools: [
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "Vite", icon: SiVite },
      { name: "Tailwind CSS", icon: SiTailwindcss },
      { name: "GSAP", icon: SiGreensock },
      { name: "Framer Motion", icon: SiFramer },
      { name: "TanStack Query", icon: SiReactquery },
      { name: "Zustand" },
      { name: "Mantine", icon: SiMantine },
      { name: "React Aria" },
      { name: "Recharts" },
    ],
  },
  {
    name: "Maps and 3D",
    tools: [
      { name: "MapLibre GL", icon: SiMaplibre },
      { name: "deck.gl" },
      { name: "OpenStreetMap", icon: SiOpenstreetmap },
      { name: "PMTiles" },
      { name: "Planetiler" },
      { name: "tippecanoe" },
      { name: "Turf.js" },
      { name: "WebGL", icon: SiWebgl },
      { name: "xeokit (BIM)" },
      { name: "web-ifc" },
    ],
  },
  {
    name: "Backend and APIs",
    tools: [
      { name: "Node.js", icon: SiNodedotjs },
      { name: "FastAPI", icon: SiFastapi },
      { name: "Laravel", icon: SiLaravel },
      { name: "Prisma", icon: SiPrisma },
      { name: "SQLAlchemy", icon: SiSqlalchemy },
      { name: "Alembic" },
      { name: "Auth.js" },
      { name: "Firebase", icon: SiFirebase },
      { name: "Stripe", icon: SiStripe },
      { name: "WebSockets" },
      { name: "MQTT", icon: SiMqtt },
      { name: ".NET Framework (WinForms)", icon: SiDotnet },
    ],
  },
  {
    name: "Data",
    tools: [
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "SQLite", icon: SiSqlite },
      { name: "Redis", icon: SiRedis },
      { name: "Firestore", icon: SiFirebase },
      { name: "pandas", icon: SiPandas },
      { name: "NumPy", icon: SiNumpy },
      { name: "Jupyter", icon: SiJupyter },
      { name: "Kaggle", icon: SiKaggle },
    ],
  },
  {
    name: "AI, vision and speech",
    tools: [
      { name: "YOLO (Ultralytics)", icon: SiUltralytics },
      { name: "PaddleOCR", icon: SiPaddlepaddle },
      { name: "OpenVINO", icon: SiIntel },
      { name: "ONNX Runtime", icon: SiOnnx },
      { name: "OpenCV", icon: SiOpencv },
      { name: "BoxMOT" },
      { name: "faster-whisper" },
      { name: "pyannote.audio" },
      { name: "Hugging Face", icon: SiHuggingface },
      { name: "scikit-learn", icon: SiScikitlearn },
      { name: "Tesseract.js" },
      { name: "FFmpeg", icon: SiFfmpeg },
      { name: "yt-dlp", icon: SiYoutube },
    ],
  },
  {
    name: "Infrastructure",
    tools: [
      { name: "Docker", icon: SiDocker },
      { name: "Docker Compose", icon: SiDocker },
      { name: "Linux", icon: SiLinux },
      { name: "Nginx", icon: SiNginx },
      { name: "GitHub Actions", icon: SiGithubactions },
      { name: "Cloudflare Tunnel", icon: SiCloudflare },
      { name: "Tailscale", icon: SiTailscale },
      { name: "Git", icon: SiGit },
      { name: "uv", icon: SiUv },
    ],
  },
  {
    name: "Testing and quality",
    tools: [
      { name: "Vitest", icon: SiVitest },
      { name: "Playwright" },
      { name: "pytest", icon: SiPytest },
      { name: "Pest" },
      { name: "PHPUnit", icon: SiPhp },
      { name: "ESLint", icon: SiEslint },
      { name: "Prettier", icon: SiPrettier },
      { name: "mypy" },
      { name: "axe-core" },
      { name: "SonarQube", icon: SiSonarqubeserver },
    ],
  },
];

export default function TechnologyStack() {
  const headingRef = useScrollReveal<HTMLDivElement>({
    from: { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", y: 22, duration: 0.92 },
    start: "top 80%",
  });
  const groupsRef = useScrollReveal<HTMLDivElement>({
    targets: ".technology-group",
    from: { autoAlpha: 0, x: -44, clipPath: "inset(0 0 30% 0)" },
    stagger: 0.16,
  });
  const toolkitRef = useScrollReveal<HTMLDivElement>({
    targets: ".toolkit-group",
    from: { autoAlpha: 0, y: 24 },
    stagger: 0.06,
  });

  return (
    <section className="technology-stage" aria-labelledby="technology-heading">
      <div className="site-shell">
        <div className="technology-heading" ref={headingRef}>
          <h2 className="section-title" id="technology-heading">
            How I build.
          </h2>
          <p className="body-large">
            A focused view of the tools I reach for, grouped by the problem they help me solve.
            Each project page carries the full implementation stack.
          </p>
        </div>

        <div className="technology-groups" ref={groupsRef}>
          {practiceAreas.map((area) => (
            <article className="technology-group" key={area.name}>
              <h3>{area.name}</h3>
              <p>{area.description}</p>
              <ul>
                {area.capabilities.map(({ icon: Icon, name }) => (
                  <li key={name}>
                    <Icon aria-hidden="true" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="toolkit" ref={toolkitRef}>
          <h3 className="toolkit-heading">
            Full toolkit <span>{toolkit.reduce((count, group) => count + group.tools.length, 0)}</span>
          </h3>
          <div className="toolkit-groups">
            {toolkit.map((group) => (
              <section className="toolkit-group" key={group.name} aria-label={group.name}>
                <h4>{group.name}</h4>
                <ul>
                  {group.tools.map(({ icon: Icon, name }) => (
                    <li key={name}>
                      {Icon && <Icon aria-hidden="true" />}
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
