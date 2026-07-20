import type { IconType } from "react-icons";
import { FaCode } from "react-icons/fa6";
import {
  SiDocker,
  SiExpress,
  SiGithub,
  SiJavascript,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiOpencv,
  SiPostgresql,
  SiPrisma,
  SiProxmox,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTailscale,
  SiTypescript,
  SiVercel,
  SiYolo,
} from "react-icons/si";

const technologyIcons: Record<string, IconType> = {
  docker: SiDocker,
  express: SiExpress,
  github: SiGithub,
  javascript: SiJavascript,
  js: SiJavascript,
  linux: SiLinux,
  nextjs: SiNextdotjs,
  nodejs: SiNodedotjs,
  opencv: SiOpencv,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  prisma: SiPrisma,
  proxmox: SiProxmox,
  python: SiPython,
  react: SiReact,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  tailscale: SiTailscale,
  typescript: SiTypescript,
  ts: SiTypescript,
  vercel: SiVercel,
  yolo: SiYolo,
};

function normalizeTechnology(technology: string) {
  return technology.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getTechnologyIcon(technology: string) {
  return technologyIcons[normalizeTechnology(technology)] ?? FaCode;
}

export function ProjectTechnologyMarks({ technologies }: { technologies: string[] }) {
  const visibleTechnologies = technologies.slice(0, 4);

  return (
    <div className="project-technology-marks">
      {visibleTechnologies.map((technology) => {
        const Icon = getTechnologyIcon(technology);

        return <Icon aria-hidden="true" key={technology} />;
      })}
    </div>
  );
}

export default function ProjectTechnologyList({
  limit,
  technologies,
}: {
  limit?: number;
  technologies: string[];
}) {
  const visibleTechnologies = typeof limit === "number" ? technologies.slice(0, limit) : technologies;

  if (visibleTechnologies.length === 0) return null;

  return (
    <ul className="project-technology-list" aria-label="Technology stack">
      {visibleTechnologies.map((technology) => {
        const Icon = getTechnologyIcon(technology);

        return (
          <li key={technology}>
            <Icon aria-hidden="true" />
            <span>{technology}</span>
          </li>
        );
      })}
    </ul>
  );
}
