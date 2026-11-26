"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FocusEvent } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import AsciiPlate, { PLATE_TONES } from "@/components/AsciiPlate";
import { formatProjectCategory } from "@/lib/projectCategory";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import type { ProjectPreview } from "@/lib/projects";

const label = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";
const pad = (n: number) => String(n).padStart(2, "0");
// Each project's plate tone, from the hero palette.
const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * The home page's projects. On desktop the section pins over the ASCII cloud and vertical scroll moves a
 * horizontal track: a title slide, then one atlas-page card per project, each snapping to the centre before
 * releasing directly to the next section. Phones and reduced motion get the same cards stacked vertically.
 */
export default function ProjectGallery({ projects }: Readonly<{ projects: ProjectPreview[] }>) {
  const ref = useRef<HTMLDivElement>(null);
  const pinRef = useRef<ScrollTrigger | null>(null);
  const stopsRef = useRef<() => number[]>(() => []);
  const [active, setActive] = useState(-1);

  useGSAP(
    () => {
      const root = ref.current;
      const track = root?.querySelector<HTMLElement>("[data-track]");
      const bar = root?.querySelector<HTMLElement>("[data-scale]");
      if (!root || !track || projects.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const slides = () => Array.from(track.children) as HTMLElement[];
        // How far the track moves to centre a slide on screen.
        const centred = (slide: HTMLElement) => slide.offsetLeft + slide.offsetWidth / 2 - root.clientWidth / 2;
        const distance = () => Math.max(1, centred(slides()[slides().length - 1]));
        stopsRef.current = () =>
          slides().map((slide, i) => (i === 0 ? 0 : Math.min(1, Math.max(0, centred(slide) / distance()))));

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            // Measure this pin before CloudField's triggers, so their range includes the scroll it adds.
            refreshPriority: 1,
            invalidateOnRefresh: true,
            snap: { snapTo: (value) => gsap.utils.snap(stopsRef.current(), value), duration: { min: 0.25, max: 0.7 }, ease: "power2.out" },
            onUpdate: (self) => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
              const stops = stopsRef.current();
              const nearest = stops.reduce(
                (best, stop, i) => (Math.abs(stop - self.progress) < Math.abs(stops[best] - self.progress) ? i : best),
                0,
              );
              setActive(nearest - 1); // slide 0 is the title
            },
          },
        });
        pinRef.current = tween.scrollTrigger ?? null;
        return () => {
          pinRef.current = null;
          stopsRef.current = () => [];
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [projects.length] },
  );

  // Keyboard: tabbing into an off-screen card scrolls the page to that card's stop, so focus stays visible.
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const pin = pinRef.current;
    const root = ref.current;
    if (!pin || !root) return;
    root.scrollLeft = 0; // the browser may scroll the clipped container to reveal focus; the track moves instead
    const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-slide]");
    const index = slide ? Number(slide.dataset.slide) : -1;
    const stop = stopsRef.current()[index];
    if (stop === undefined) return;
    const y = pin.start + (pin.end - pin.start) * stop;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  };

  // Cards hug their content up to the pinned height, so tall screens do not stretch them into empty bands.
  const slide = "w-full shrink-0 lg:max-h-[calc(100svh-10.5rem)] lg:w-[min(80vw,66rem)]";
  return (
    <div ref={ref} className="relative overflow-x-clip py-[clamp(6rem,11vw,9rem)] lg:h-svh lg:overflow-hidden lg:py-0 lg:pt-[6.5rem]">
      <div data-track onFocus={handleFocus} className="flex flex-col gap-8 px-4 lg:h-full lg:flex-row lg:items-center lg:gap-10 lg:pb-16 lg:pl-[max(1rem,calc((100vw-82rem)/2))] lg:pr-[max(1rem,calc((100vw-82rem)/2))]">
        <div data-slide="0" className={`${slide} flex flex-col justify-center`}>
          {/* The scrim sits above the cloud canvas (z -1) and below the text, so glyphs fade behind the words. */}
          <div className="relative">
            <span aria-hidden="true" className="absolute -inset-x-20 -inset-y-14 z-0 bg-[radial-gradient(farthest-side,var(--background)_62%,color-mix(in_srgb,var(--background)_70%,transparent)_80%,transparent)]" />
            <h2 className="section-title section-title-wide relative z-[1]">A few things <span>I&apos;ve built.</span></h2>
            <p className="body-large site-muted relative z-[1] mt-5 max-w-[34rem]">I like working on systems where reliability matters. These case studies show how I think, build, and ship.</p>
            <p className={`${label} relative z-[1] mt-8 flex flex-wrap items-center gap-x-6 gap-y-3`}>
              {projects.length > 0 && <span className="site-muted hidden lg:inline">Scroll to travel · {pad(projects.length)} projects</span>}
              <Link href="/projects" className="inline-flex min-h-11 items-center gap-2 text-[var(--accent)] underline-offset-4 hover:underline">All projects <FaArrowRight aria-hidden="true" /></Link>
            </p>
          </div>
        </div>

        {projects.map((project, index) => (
          <GalleryCard key={project.slug} project={project} index={index} total={projects.length} active={active === index} className={slide} />
        ))}
      </div>

      {/* Progress as a map scale bar: alternating segments that fill as the track moves. */}
      {projects.length > 0 && (
        <div aria-hidden="true" className="site-shell absolute inset-x-0 bottom-5 hidden lg:block">
          <div className={`${label} site-muted mb-1.5 flex w-72 justify-between`}><span>0</span><span>{pad(projects.length)}</span></div>
          <div className="relative h-2 w-72">
            <div className="absolute inset-0 border-[1.5px] border-[var(--foreground)] bg-[repeating-linear-gradient(90deg,var(--foreground)_0_12.5%,transparent_12.5%_25%)] opacity-40" />
            <div data-scale className="absolute inset-0 origin-left bg-[var(--postcard-orange)]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      )}
    </div>
  );
}

type GalleryCardProps = Readonly<{ project: ProjectPreview; index: number; total: number; active: boolean; className: string }>;

/**
 * One project as an atlas page. Desktop: the 16:9 picture with "what changed" as its caption on the left; the
 * title, summary, stack and actions on the right, so both columns end near the same height. Phones stack it all,
 * title before the notes.
 */
function GalleryCard({ project, index, total, active, className }: GalleryCardProps) {
  const liveUrl = project.projectUrl || project.demoUrl;
  const note = `${label} text-[var(--postcard-rust)]`;
  return (
    <article
      data-slide={index + 1}
      aria-labelledby={`project-${project.slug}`}
      className={`${className} flex flex-col overflow-hidden rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)] [--line:color-mix(in_srgb,var(--postcard-ink)_12%,transparent)]`}
    >
      <header className={`${label} flex h-11 shrink-0 items-stretch border-b border-[var(--line)]`}>
        <span className="flex items-center border-r border-[var(--line)] px-5 text-[var(--postcard-rust)]">Fig. {pad(index + 1)} / {pad(total)}</span>
        <span className="flex min-w-0 items-center truncate px-5 text-[var(--postcard-muted)]">{formatProjectCategory(project.category)}</span>
        {project.year && <span className="ml-auto flex items-center px-5 text-[var(--postcard-muted)]">{project.year}</span>}
      </header>

      {/* The column wrappers are `contents` on phones, so `order` can put the title right under the picture. */}
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="contents lg:flex lg:flex-col lg:border-r lg:border-[var(--line)]">
          <Link href={`/projects/${project.slug}`} tabIndex={-1} aria-hidden="true" className="relative order-1 grid aspect-video lg:order-none shrink-0 place-items-center overflow-hidden border-b border-[var(--line)] bg-[var(--background)]">
            {project.thumbnail ? (
              <Image src={project.thumbnail} alt="" fill unoptimized sizes="(max-width: 1023px) calc(100vw - 2rem), 38rem" className="object-cover" />
            ) : (
              <AsciiPlate pattern={index} run={active} color={PLATE_TONES[index % PLATE_TONES.length]} className="text-[clamp(4px,min(1.02vh,0.56vw),11px)] max-lg:text-[clamp(4px,1.1vw,7px)]" />
            )}
          </Link>
          {project.outcome && (
            <dl className="order-3 mx-6 mt-5 border-t border-[var(--line)] pt-5 text-[0.9375rem] leading-[1.55] lg:order-none lg:m-0 lg:border-t-0 lg:px-7 lg:pb-6">
              <dt className={note}>What changed</dt><dd className="mt-1.5 font-semibold text-[var(--postcard-rust)]">{project.outcome}</dd>
            </dl>
          )}
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-5 lg:p-7">
          <div className="order-2 px-6 pt-6 lg:order-none lg:p-0">
            <h3 id={`project-${project.slug}`} className="text-[clamp(1.8rem,2.8vw,2.7rem)] font-[620] leading-[0.95] tracking-[-0.035em]">
              <Link href={`/projects/${project.slug}`} className="hover:text-[var(--postcard-rust)]">{project.title}<span className="text-[var(--postcard-orange)]">.</span></Link>
            </h3>
            <p className="mt-3 text-[1.0625rem] leading-[1.55] text-[var(--postcard-muted)]">{project.summary}</p>
          </div>

          {project.techStack.length > 0 && (
            <dl className="order-4 mx-6 mt-5 text-[0.9375rem] leading-[1.55] lg:order-none lg:m-0 lg:border-t lg:border-[var(--line)] lg:pt-5">
              <dt className={note}>Built with</dt>
              <dd className="mt-2"><ul className="grid grid-cols-2 gap-x-6 font-mono text-[0.8125rem]">{project.techStack.slice(0, 8).map((tool) => <li key={tool} className="border-b border-[var(--line)] py-1">{tool}</li>)}</ul></dd>
            </dl>
          )}

          <div className="order-5 flex flex-wrap items-end gap-2 px-6 pb-6 pt-5 lg:order-none lg:mt-auto lg:p-0" role="group" aria-label={`${project.title} links`}>
            <Link href={`/projects/${project.slug}`} className="postcard-button postcard-button-primary">
              Case study
              <FaArrowRight aria-hidden="true" />
            </Link>
            {liveUrl && (
              <a href={liveUrl} rel="noreferrer" target="_blank" aria-label={`${project.title} live project (opens in a new tab)`} className="postcard-button">
                Live
                <FaArrowUpRightFromSquare aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} rel="noreferrer" target="_blank" aria-label={`${project.title} code on GitHub (opens in a new tab)`} className="postcard-button">
                <FaGithub aria-hidden="true" />
                Code
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
