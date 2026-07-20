import type { IconType } from "react-icons";
import {
  SiDocker,
  SiIntel,
  SiLinux,
  SiNextdotjs,
  SiOpencv,
  SiPostgresql,
  SiPrisma,
  SiProxmox,
  SiPython,
  SiTailscale,
  SiTypescript,
  SiYolo,
} from "react-icons/si";

interface Technology {
  icon: IconType;
  name: string;
}

interface TechnologyGroup {
  description: string;
  name: string;
  technologies: Technology[];
}

const technologyGroups: TechnologyGroup[] = [
  {
    name: "Backend and product",
    description: "I use these for typed applications, APIs, data models, and the interfaces around them.",
    technologies: [
      { name: "TypeScript", icon: SiTypescript },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "Prisma", icon: SiPrisma },
    ],
  },
  {
    name: "Infrastructure",
    description: "I use these to keep services self-hosted, deployments repeatable, and networks private.",
    technologies: [
      { name: "Linux", icon: SiLinux },
      { name: "Docker", icon: SiDocker },
      { name: "Proxmox", icon: SiProxmox },
      { name: "Tailscale", icon: SiTailscale },
    ],
  },
  {
    name: "Applied AI",
    description: "I use these for computer-vision pipelines that need to work outside a notebook.",
    technologies: [
      { name: "Python", icon: SiPython },
      { name: "OpenCV", icon: SiOpencv },
      { name: "YOLO", icon: SiYolo },
      { name: "OpenVINO", icon: SiIntel },
    ],
  },
];

const technologies = technologyGroups.flatMap((group) => group.technologies);

function TechnologyRailList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="tool-rail-list" aria-hidden={hidden || undefined}>
      {technologies.map(({ icon: Icon, name }) => (
        <li key={name}>
          <Icon aria-hidden="true" />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TechnologyStack() {
  return (
    <section className="technology-stage" aria-labelledby="technology-heading">
      <div className="site-shell">
        <div className="technology-heading">
          <h2 className="section-title" id="technology-heading">
            How I build.
          </h2>
          <p className="body-large">
            I reach for different tools depending on the problem. Here&apos;s how they fit into the
            work I do.
          </p>
        </div>

        <div className="technology-groups">
          {technologyGroups.map((group) => (
            <article className="technology-group" key={group.name}>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <ul>
                {group.technologies.map(({ icon: Icon, name }) => (
                  <li key={name}>
                    <Icon aria-hidden="true" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="tool-rail mt-16" aria-label="Technology stack overview">
        <div className="tool-rail-track">
          <TechnologyRailList />
          <TechnologyRailList hidden />
        </div>
      </div>
    </section>
  );
}
