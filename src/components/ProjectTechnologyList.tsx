import type { IconType } from "react-icons";
import { FaCode, FaShieldHalved } from "react-icons/fa6";
import {
  SiCloudflare,
  SiCss,
  SiDocker,
  SiDotnet,
  SiExpress,
  SiFfmpeg,
  SiFramer,
  SiGithub,
  SiGithubpages,
  SiHtml5,
  SiHuggingface,
  SiJavascript,
  SiLaravel,
  SiLinux,
  SiNginx,
  SiNextdotjs,
  SiNodedotjs,
  SiOpencv,
  SiPostgresql,
  SiPrisma,
  SiProxmox,
  SiPython,
  SiReact,
  SiRedis,
  SiSonarqubeserver,
  SiSqlite,
  SiTailwindcss,
  SiTailscale,
  SiTypescript,
  SiVercel,
  SiYolo,
} from "react-icons/si";

const technologyIcons: Record<string, IconType> = {
  cloudflare: SiCloudflare,
  css: SiCss,
  docker: SiDocker,
  dockercompose: SiDocker,
  dotnet: SiDotnet,
  express: SiExpress,
  ffmpeg: SiFfmpeg,
  framermotion: SiFramer,
  github: SiGithub,
  githubapi: SiGithub,
  githubpages: SiGithubpages,
  html: SiHtml5,
  huggingface: SiHuggingface,
  javascript: SiJavascript,
  js: SiJavascript,
  laravel: SiLaravel,
  linux: SiLinux,
  nginx: SiNginx,
  nextjs: SiNextdotjs,
  nodejs: SiNodedotjs,
  opencv: SiOpencv,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  prisma: SiPrisma,
  proxmox: SiProxmox,
  python: SiPython,
  react: SiReact,
  rbac: FaShieldHalved,
  redis: SiRedis,
  sonarqube: SiSonarqubeserver,
  sqlite: SiSqlite,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  tailscale: SiTailscale,
  typescript: SiTypescript,
  ts: SiTypescript,
  vercel: SiVercel,
  yolo: SiYolo,
};

type ProjectTechnologyListProps = Readonly<{
  limit?: number,
  technologies: string[],
}>;

function normalizeTechnology(technology: string) {
  return technology.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getTechnologyIcon(technology: string) {
  return technologyIcons[normalizeTechnology(technology)] ?? FaCode;
}

export function ProjectTechnologyMarks({ technologies }: Readonly<{ technologies: string[] }>) {
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

export default function ProjectTechnologyList({ limit, technologies }: ProjectTechnologyListProps) {
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
