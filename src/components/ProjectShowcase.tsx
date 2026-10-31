"use client";

import { useMemo, useRef, useState } from "react";
import { FaArrowUpRightFromSquare, FaGithub, FaRotateRight } from "react-icons/fa6";

import ProjectCard, { formatProjectCategory } from "@/components/ProjectCard";
import { useTimedFetch } from "@/hooks/useTimedFetch";
import { Flip, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { ProjectPreview } from "@/lib/projects";

type ProjectShowcaseProps = Readonly<{
  compact?: boolean;
  featured?: boolean;
  initialProjects?: ProjectPreview[];
  limit?: number;
  loadImmediately?: boolean;
}>;

export default function ProjectShowcase({
  loadImmediately = false,
  ...props
}: ProjectShowcaseProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: boundaryRef.current,
      start: "top bottom+=120",
      once: true,
      onEnter: () => setIsNearViewport(true),
    });
  });
  const shouldLoad = loadImmediately || isNearViewport;

  return (
    <div className="project-showcase-boundary" ref={boundaryRef}>
      <ProjectShowcaseContent {...props} enabled={shouldLoad} />
    </div>
  );
}

function ProjectShowcaseContent({
  compact = false,
  enabled,
  featured = false,
  initialProjects,
  limit,
}: ProjectShowcaseProps & Readonly<{ enabled: boolean }>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<Flip.FlipState | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Record card positions before a filter change so Flip can animate the reflow.
  const captureLayout = () => {
    const cards = rootRef.current?.querySelectorAll(".project-card");
    if (cards?.length && !prefersReducedMotion()) layoutRef.current = Flip.getState(cards);
  };
  const changeCategory = (category: string) => {
    captureLayout();
    setActiveCategory(category);
  };
  const changeSearch = (value: string) => {
    captureLayout();
    setSearch(value);
  };
  const { data, retry, status } = useTimedFetch<{ projects: ProjectPreview[] }>(
    "/api/projects",
    3_500,
    initialProjects === undefined ? undefined : { projects: initialProjects },
    enabled,
  );

  const availableProjects = useMemo(() => {
    const projects = data?.projects ?? [];
    const selected = featured
      ? (() => {
        const pinned = projects.filter((project) => project.isPinned);
        return pinned.length > 0 ? pinned : projects.slice(0, 3);
      })()
      : projects;

    return typeof limit === "number" ? selected.slice(0, limit) : selected;
  }, [data, featured, limit]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(availableProjects.map((project) => formatProjectCategory(project.category))),
      ),
    ],
    [availableProjects],
  );

  const filteredProjects = availableProjects.filter((project) => {
    const query = search.trim().toLowerCase();
    const category = formatProjectCategory(project.category);
    const matchesCategory = activeCategory === "All" || category === activeCategory;
    const matchesSearch =
      query.length === 0 ||
      project.title.toLowerCase().includes(query) ||
      project.summary.toLowerCase().includes(query) ||
      project.techStack.some((technology) => technology.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  useGSAP(
    () => {
      const state = layoutRef.current;
      layoutRef.current = null;
      if (!state) return;
      Flip.from(state, {
        targets: rootRef.current?.querySelectorAll(".project-card"),
        duration: 0.5,
        ease: "power3.out",
        absolute: true,
        onEnter: (elements) => gsap.fromTo(elements, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.4 }),
      });
    },
    { dependencies: [activeCategory, search], scope: rootRef },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".filter-active-indicator", { scaleX: 0, transformOrigin: "left center", duration: 0.32 });
    },
    { dependencies: [activeCategory], scope: rootRef },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".project-fallback, .project-filter-empty", { autoAlpha: 0, y: 16, duration: 0.5 });
    },
    { dependencies: [status, filteredProjects.length === 0], scope: rootRef },
  );

  if (status === "loading") {
    return (
      <div className="project-loading-state" aria-busy="true" role="status">
        <span>Loading selected work</span>
        <span aria-hidden="true" className="project-loading-track">
          <span />
        </span>
      </div>
    );
  }

  if (status === "timeout" || status === "error" || availableProjects.length === 0) {
    const title =
      status === "timeout"
        ? "Projects took too long to load."
        : "Projects are unavailable right now.";

    return (
      <div className="empty-state project-fallback" role="status" ref={rootRef}>
        <h3>{title}</h3>
        <p>
          The case studies could not be retrieved. You can still inspect the source and recent work
          on GitHub.
        </p>
        <div className="empty-state-actions">
          <button className="button-secondary" type="button" onClick={retry}>
            <FaRotateRight aria-hidden="true" />
            Try again
          </button>
          <a
            className="button-primary"
            href="https://github.com/KvassAndVodka"
            aria-label="Javier Raut on GitHub (opens in a new tab)"
            rel="noreferrer"
            target="_blank"
          >
            <FaGithub aria-hidden="true" />
            Open GitHub
            <FaArrowUpRightFromSquare aria-hidden="true" className="button-external-icon" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
        {!compact && availableProjects.length > 0 && (
          <div className="filter-toolbar">
            <div className="filter-index">
              <p className="project-result-count" aria-live="polite">
                Showing {filteredProjects.length} of {availableProjects.length} projects
              </p>
              <div className="filter-tabs" aria-label="Filter projects by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => changeCategory(category)}
                    aria-pressed={activeCategory === category}
                  >
                    <span>{category}</span>
                    {activeCategory === category && (
                      <span aria-hidden="true" className="filter-active-indicator" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <label className="search-field">
              Search projects
              <input
                type="search"
                placeholder="Title, summary, or technology"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
              />
            </label>
          </div>
        )}

          {filteredProjects.length === 0 ? (
            <div className="empty-state project-filter-empty" role="status">
              <p>No projects match those filters.</p>
              <button
                className="button-secondary mt-6"
                type="button"
                onClick={() => {
                  changeSearch("");
                  changeCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              className={`project-grid ${compact ? "project-grid-compact" : "project-grid-index"}`}
              data-count={filteredProjects.length}
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  compact={compact}
                  index={index}
                  key={project.slug}
                  project={project}
                  featured={!compact && index === 0}
                />
              ))}
            </div>
          )}
    </div>
  );
}
