"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import ProjectTechnologyList, { ProjectTechnologyMarks } from "@/components/ProjectTechnologyList";
import useScrollReveal from "@/hooks/useScrollReveal";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { ProjectPreview } from "@/lib/projects";

type ProjectCardProps = Readonly<{
  compact?: boolean;
  featured?: boolean;
  index?: number;
  project: ProjectPreview;
}>;

export function formatProjectCategory(category?: string) {
  if (!category) return "Independent project";

  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProjectCard({
  compact = false,
  featured = false,
  index = 0,
  project,
}: ProjectCardProps) {
  const liveProjectUrl = project.projectUrl || project.demoUrl;
  const revealRef = useScrollReveal<HTMLElement>({
    from: { autoAlpha: 0, y: 56, clipPath: "inset(0 0 18% 0)", scale: 0.985 },
    delay: Math.min(index * 0.1, 0.34),
    start: "top 90%",
  });
  const tiltRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  useGSAP(() => {
    const card = revealRef.current;
    if (!card) return;
    gsap.set(card, { transformPerspective: 1200 });
    tiltRef.current = {
      x: gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3.out" }),
      y: gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3.out" }),
    };
  });

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltRef.current?.y(((event.clientX - bounds.left) / bounds.width - 0.5) * 4.8);
    tiltRef.current?.x(-((event.clientY - bounds.top) / bounds.height - 0.5) * 4.4);
  };

  const resetTilt = () => {
    tiltRef.current?.x(0);
    tiltRef.current?.y(0);
  };

  return (
    <article
      className={`project-card group${featured ? " project-card-featured" : ""}${compact ? " project-card-bento" : ""}`}
      ref={revealRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
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
            <a
              href={project.githubUrl}
              aria-label={`${project.title} code on GitHub (opens in a new tab)`}
              rel="noreferrer"
              target="_blank"
            >
              <FaGithub aria-hidden="true" />
              Code
            </a>
          )}
          {liveProjectUrl && (
            <a
              href={liveProjectUrl}
              aria-label={`${project.title} live project (opens in a new tab)`}
              rel="noreferrer"
              target="_blank"
            >
              Live
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
