import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import ProjectTechnologyList, { ProjectTechnologyMarks } from "@/components/ProjectTechnologyList";
import type { ProjectPreview } from "@/lib/projects";

export function formatProjectCategory(category?: string) {
  if (!category) return "Independent project";

  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProjectCard({
  compact = false,
  featured = false,
  project,
}: {
  compact?: boolean;
  featured?: boolean;
  project: ProjectPreview;
}) {
  const liveProjectUrl = project.projectUrl || project.demoUrl;

  return (
    <article className={`project-card group${featured ? " project-card-featured" : ""}${compact ? " project-card-bento" : ""}`}>
      <Link className="project-card-media" href={`/projects/${project.slug}`}>
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={`${project.title} project preview`}
            fill
            unoptimized
            sizes="(max-width: 767px) calc(100vw - 2rem), 52vw"
            className="object-cover"
          />
        ) : (
          <div className="project-card-fallback" aria-hidden="true">
            <ProjectTechnologyMarks technologies={project.techStack} />
            <span>{formatProjectCategory(project.category)}</span>
          </div>
        )}
      </Link>

      <div className="project-card-body">
        <div className="project-card-heading">
          <p className="project-card-category">{formatProjectCategory(project.category)}</p>
          {project.isPinned && <span className="project-card-selection">Selected work</span>}
        </div>
        <h3>
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p className="project-card-summary line-clamp-3">{project.summary}</p>
        <ProjectTechnologyList limit={featured || compact ? 5 : 4} technologies={project.techStack} />

        <div className="project-card-links" aria-label={`${project.title} links`}>
          <Link className="project-card-case-study" href={`/projects/${project.slug}`}>
            Case study
            <FaArrowRight aria-hidden="true" />
          </Link>
          {project.githubUrl && (
            <a href={project.githubUrl} rel="noreferrer" target="_blank">
              <FaGithub aria-hidden="true" />
              Code
            </a>
          )}
          {liveProjectUrl && (
            <a href={liveProjectUrl} rel="noreferrer" target="_blank">
              Live
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
