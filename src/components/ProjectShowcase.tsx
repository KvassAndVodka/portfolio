"use client";

import { useMemo, useState } from "react";
import { FaArrowUpRightFromSquare, FaGithub, FaRotateRight } from "react-icons/fa6";

import ProjectCard, { formatProjectCategory } from "@/components/ProjectCard";
import ProjectSkeleton from "@/components/ProjectSkeleton";
import { useTimedFetch } from "@/hooks/useTimedFetch";
import type { ProjectPreview } from "@/lib/projects";

interface ProjectShowcaseProps {
  compact?: boolean;
  featured?: boolean;
  limit?: number;
}

export default function ProjectShowcase({
  compact = false,
  featured = false,
  limit,
}: ProjectShowcaseProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data, retry, status } = useTimedFetch<{ projects: ProjectPreview[] }>("/api/projects");

  const initialProjects = useMemo(() => {
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
        new Set(initialProjects.map((project) => formatProjectCategory(project.category))),
      ),
    ],
    [initialProjects],
  );

  const filteredProjects = initialProjects.filter((project) => {
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
    const skeletonCount = compact ? 3 : 4;

    return (
      <div
        className={`project-grid ${compact ? "project-grid-compact" : "project-grid-index"}`}
        data-count={skeletonCount}
        aria-busy="true"
        aria-label="Loading projects"
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProjectSkeleton key={index} featured={!compact && index === 0} />
        ))}
      </div>
    );
  }

  if (status === "timeout" || status === "error" || initialProjects.length === 0) {
    const title = status === "timeout" ? "Projects took too long to load." : "Projects are unavailable right now.";

    return (
      <div className="empty-state project-fallback" role="status">
        <h3>{title}</h3>
        <p>
          The case studies could not be retrieved. You can still inspect the source and recent work on GitHub.
        </p>
        <div className="empty-state-actions">
          <button className="button-secondary" type="button" onClick={retry}>
            <FaRotateRight aria-hidden="true" />
            Try again
          </button>
          <a
            className="button-primary"
            href="https://github.com/KvassAndVodka"
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
    <div>
      {!compact && initialProjects.length > 0 && (
        <div className="filter-toolbar">
          <div className="filter-index">
            <p className="project-result-count" aria-live="polite">
              Showing {filteredProjects.length} of {initialProjects.length} projects
            </p>
            <div className="filter-tabs" aria-label="Filter projects by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {category}
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
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="empty-state" role="status">
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
        </div>
      ) : (
        <div
          className={`project-grid ${compact ? "project-grid-compact" : "project-grid-index"}`}
          data-count={filteredProjects.length}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              compact={compact}
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
