"use client";

import { AnimatePresence, LayoutGroup, m, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { FaArrowUpRightFromSquare, FaGithub, FaRotateRight } from "react-icons/fa6";

import ProjectCard, { formatProjectCategory } from "@/components/ProjectCard";
import { useTimedFetch } from "@/hooks/useTimedFetch";
import type { ProjectPreview } from "@/lib/projects";

type ProjectShowcaseProps = Readonly<{
  compact?: boolean;
  featured?: boolean;
  limit?: number;
  loadImmediately?: boolean;
}>;

export default function ProjectShowcase({
  loadImmediately = false,
  ...props
}: ProjectShowcaseProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const isNearViewport = useInView(boundaryRef, {
    margin: "0px 0px 120px 0px",
    once: true,
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
  limit,
}: ProjectShowcaseProps & Readonly<{ enabled: boolean }>) {
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data, retry, status } = useTimedFetch<{ projects: ProjectPreview[] }>(
    "/api/projects",
    3_500,
    undefined,
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
      <m.div
        className="empty-state project-fallback"
        role="status"
        initial={reduceMotion ? false : { opacity: 0, clipPath: "inset(0 0 18% 0)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
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
      </m.div>
    );
  }

  return (
    <LayoutGroup id={compact ? "featured-projects" : "project-index"}>
      <div>
        {!compact && availableProjects.length > 0 && (
          <m.div className="filter-toolbar" layout>
            <div className="filter-index">
              <p className="project-result-count" aria-live="polite">
                Showing {filteredProjects.length} of {availableProjects.length} projects
              </p>
              <div className="filter-tabs" aria-label="Filter projects by category">
                {categories.map((category) => (
                  <m.button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    <span>{category}</span>
                    {activeCategory === category && (
                      <m.span
                        aria-hidden="true"
                        className="filter-active-indicator"
                        layoutId="project-filter-active"
                        transition={{ type: "spring", stiffness: 430, damping: 36 }}
                      />
                    )}
                  </m.button>
                ))}
              </div>
            </div>

            <label className="search-field">
              Search projects
              <input
                type="search"
                placeholder="Title, summary, or technology"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </m.div>
        )}

        <AnimatePresence initial={false} mode="wait">
          {filteredProjects.length === 0 ? (
            <m.div
              className="empty-state"
              key="empty-project-filter"
              role="status"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            >
              <p>No projects match those filters.</p>
              <button
                className="button-secondary mt-6"
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              >
                Clear filters
              </button>
            </m.div>
          ) : (
            <m.div
              className={`project-grid ${compact ? "project-grid-compact" : "project-grid-index"}`}
              data-count={filteredProjects.length}
              key="project-grid"
              layout
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
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
