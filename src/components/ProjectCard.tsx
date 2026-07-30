"use client";

import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { PointerEvent as ReactPointerEvent } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import ProjectTechnologyList, { ProjectTechnologyMarks } from "@/components/ProjectTechnologyList";
import useSafeReveal from "@/hooks/useSafeReveal";
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
  const {
    ref: revealRef,
    isRevealed,
    reduceMotion,
  } = useSafeReveal<HTMLElement>({ amount: 0.16 });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 240, damping: 28, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 240, damping: 28, mass: 0.4 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-2.4, 2.4]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [2.2, -2.2]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <m.article
      className={`project-card group${featured ? " project-card-featured" : ""}${compact ? " project-card-bento" : ""}`}
      ref={revealRef}
      layout="position"
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 56, clipPath: "inset(0 0 18% 0)", scale: 0.985 }
      }
      animate={
        isRevealed
          ? { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", scale: 1 }
          : { opacity: 0, y: 56, clipPath: "inset(0 0 18% 0)", scale: 0.985 }
      }
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, scale: 0.96, clipPath: "inset(0 0 12% 0)", transition: { duration: 0.2 } }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.76,
        delay: reduceMotion ? 0 : Math.min(index * 0.1, 0.34),
        ease: [0.16, 1, 0.3, 1],
        layout: { type: "spring", stiffness: 320, damping: 34 },
      }}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 1200,
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.992 }}
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
    </m.article>
  );
}
