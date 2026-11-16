"use client";

import { useMemo, useRef, useState } from "react";
import { FaArrowUpRightFromSquare, FaGithub, FaRotateRight } from "react-icons/fa6";

import Pagination, { paginate } from "@/components/Pagination";
import ProjectCard from "@/components/ProjectCard";
import { formatProjectCategory } from "@/lib/projectCategory";
import { useTimedFetch } from "@/hooks/useTimedFetch";
import { Flip, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollBelowHeader } from "@/lib/lenis";
import type { ProjectPreview } from "@/lib/projects";

type ProjectShowcaseProps = Readonly<{
  initialProjects?: ProjectPreview[];
  loadImmediately?: boolean;
}>;

const PAGE_SIZE = 6;

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

// A card's scroll reveal leaves it hidden and offset until it plays. Flip must not move a card in that
// state, so a filter change plays any pending reveal to its end first.
function finishReveals(cards: NodeListOf<Element>) {
  for (const tween of gsap.getTweensOf(cards)) {
    if (tween.scrollTrigger) tween.progress(1).kill();
  }
}

function ProjectShowcaseContent({
  enabled,
  initialProjects,
}: ProjectShowcaseProps & Readonly<{ enabled: boolean }>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<Flip.FlipState | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  // Record card positions before a filter change so Flip can animate the reflow.
  const captureLayout = () => {
    const cards = rootRef.current?.querySelectorAll(".project-card");
    if (!cards?.length || prefersReducedMotion()) return;
    finishReveals(cards);
    layoutRef.current = Flip.getState(cards);
  };
  // A new filter starts from the first page.
  const changeCategory = (category: string) => {
    captureLayout();
    setActiveCategory(category);
    setPage(1);
  };
  const changeSearch = (value: string) => {
    captureLayout();
    setSearch(value);
    setPage(1);
  };
  // A new page jumps back to the top of the list: no reflow animation, it's a different set of cards.
  const changePage = (next: number) => {
    setPage(next);
    if (rootRef.current) scrollBelowHeader(rootRef.current);
  };
  const { data, retry, status } = useTimedFetch<{ projects: ProjectPreview[] }>(
    "/api/projects",
    3_500,
    initialProjects === undefined ? undefined : { projects: initialProjects },
    enabled,
  );

  const availableProjects = useMemo(() => data?.projects ?? [], [data]);

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
  const shown = paginate(filteredProjects, page, PAGE_SIZE);

  useGSAP(
    () => {
      const state = layoutRef.current;
      layoutRef.current = null;
      if (!state) return;
      const cards = rootRef.current?.querySelectorAll(".project-card");
      if (!cards?.length) return;
      finishReveals(cards);
      if (prefersReducedMotion()) return;
      // Transforms only: `absolute: true` placed entering cards against the wrong containing block, over the hero.
      Flip.from(state, {
        targets: cards,
        duration: 0.3,
        ease: "power3.out",
        onEnter: (elements) => gsap.fromTo(elements, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.22 }),
        // The grid changed height, so triggers further down the page start at the wrong place.
        onComplete: () => ScrollTrigger.refresh(),
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
      <output className="project-loading-state" aria-busy="true">
        <span>Loading selected work</span>
        <span aria-hidden="true" className="project-loading-track">
          <span />
        </span>
      </output>
    );
  }

  if (status === "timeout" || status === "error" || availableProjects.length === 0) {
    const title =
      status === "timeout"
        ? "Projects took too long to load."
        : "Projects are unavailable right now.";

    return (
      <div ref={rootRef}>
        <output className="empty-state project-fallback">
          <h3>{title}</h3>
          <p>
            The case studies could not be retrieved. You can still inspect the source and recent work
            on GitHub.
          </p>
          <div className="empty-state-actions">
            <button className="postcard-button" type="button" onClick={retry}>
              <FaRotateRight aria-hidden="true" />
              Try again
            </button>
            <a
              className="postcard-button postcard-button-primary"
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
        </output>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      <div className="filter-toolbar">
        <div className="filter-index">
          <p className="project-result-count" aria-live="polite">
            Showing {filteredProjects.length} of {availableProjects.length}
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
                {activeCategory === category && <span aria-hidden="true" className="filter-active-indicator" />}
              </button>
            ))}
          </div>
        </div>

        <label className="search-field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Title, summary, or technology"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
          />
        </label>
      </div>

      {filteredProjects.length === 0 ? (
        <output className="empty-state project-filter-empty">
          <p>No projects match those filters.</p>
          <button
            className="postcard-button mt-6"
            type="button"
            onClick={() => {
              changeSearch("");
              changeCategory("All");
            }}
          >
            Clear filters
          </button>
        </output>
      ) : (
        <>
          <div className="project-grid" key={shown.page}>
            {shown.items.map((project, position) => (
              <ProjectCard
                index={availableProjects.indexOf(project)}
                key={project.slug}
                position={position}
                project={project}
                total={availableProjects.length}
              />
            ))}
          </div>
          <Pagination label="Project pages" page={shown.page} pages={shown.pages} onChange={changePage} />
        </>
      )}
    </div>
  );
}
