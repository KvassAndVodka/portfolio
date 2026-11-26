"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import AsciiPlate, { PLATE_TONES } from "@/components/AsciiPlate";
import useScrollReveal from "@/hooks/useScrollReveal";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { formatProjectCategory } from "@/lib/projectCategory";
import type { ProjectPreview } from "@/lib/projects";

type ProjectCardProps = Readonly<{
  /** The project's place in the whole list, 0-based, for its figure number and plate. */
  index: number;
  total: number;
  /** Its place on the current page, for the reveal stagger. */
  position?: number;
  project: ProjectPreview;
}>;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * One project as an atlas page, like the home gallery's cards: a mono strip with the figure number,
 * category and year, the picture (screenshot, or the still ASCII plate), then title, summary, tools and links.
 */
export default function ProjectCard({ index, total, position = 0, project }: ProjectCardProps) {
  const liveProjectUrl = project.projectUrl || project.demoUrl;
  const revealRef = useScrollReveal<HTMLElement>({
    from: { autoAlpha: 0, y: 16 },
    duration: 0.5,
    delay: (position % 2) * 0.06,
    start: "top 92%",
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

  // A slight lean toward the pointer, mouse only: decorative, so it follows with momentum rather than snapping.
  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltRef.current?.y(((event.clientX - bounds.left) / bounds.width - 0.5) * 3);
    tiltRef.current?.x(-((event.clientY - bounds.top) / bounds.height - 0.5) * 3);
  };

  const resetTilt = () => {
    tiltRef.current?.x(0);
    tiltRef.current?.y(0);
  };

  return (
    <article
      className="project-card"
      ref={revealRef}
      aria-labelledby={`project-${project.slug}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <header className="project-card-strip">
        <span className="project-card-figure">
          Fig. {pad(index + 1)} / {pad(total)}
        </span>
        <span className="project-card-category">{formatProjectCategory(project.category)}</span>
        {project.year && <span className="project-card-year">{project.year}</span>}
      </header>

      <Link className="project-card-media" href={`/projects/${project.slug}`} tabIndex={-1} aria-hidden="true">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 767px) calc(100vw - 2rem), 40rem"
            className="object-cover"
          />
        ) : (
          <AsciiPlate
            pattern={index}
            color={PLATE_TONES[index % PLATE_TONES.length]}
            className="text-[clamp(4px,0.62vw,8px)] max-md:text-[clamp(4px,1.25vw,7px)]"
          />
        )}
      </Link>

      <div className="project-card-body">
        <h2 id={`project-${project.slug}`}>
          <Link href={`/projects/${project.slug}`}>
            {project.title}
            <span className="title-dot">.</span>
          </Link>
        </h2>
        <p className="project-card-summary">{project.summary}</p>

        {project.outcome && (
          <p className="project-card-outcome">
            <span className="project-card-label">What changed</span>
            {project.outcome}
          </p>
        )}

        {project.techStack.length > 0 && (
          <div className="project-card-built">
            <span className="project-card-label">Built with</span>
            <ul>
              {project.techStack.slice(0, 6).map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
        )}

        <nav className="project-card-links" aria-label={`${project.title} links`}>
          <Link className="postcard-button postcard-button-primary" href={`/projects/${project.slug}`}>
            Case study
            <FaArrowRight aria-hidden="true" />
          </Link>
          {liveProjectUrl && (
            <a
              className="postcard-button"
              href={liveProjectUrl}
              aria-label={`${project.title} live project (opens in a new tab)`}
              rel="noreferrer"
              target="_blank"
            >
              Live
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          )}
          {project.githubUrl && (
            <a
              className="postcard-button"
              href={project.githubUrl}
              aria-label={`${project.title} code on GitHub (opens in a new tab)`}
              rel="noreferrer"
              target="_blank"
            >
              <FaGithub aria-hidden="true" />
              Code
            </a>
          )}
        </nav>
      </div>
    </article>
  );
}
