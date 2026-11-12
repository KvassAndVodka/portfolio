"use client";
// PROTOTYPE: "A few things I've built" and "How I build", driven by GSAP + Lenis.
// Three project-section variants, switchable with ?variant=A|B|C and the floating bar (or ← →):
//   A Picker  (list + figure panel, pinned, scroll steps through projects)
//   B Gallery (pinned horizontal track of full-height project slides, map scale bar for progress)
//   C Index   (big typographic list, no pin; hovering a project floats its ASCII plate by the cursor)
// Projects sit on the real ASCII cloud (CloudField). Elements follow the site's language: straight corners,
// a ruled terminal list (selected line inverted), ASCII marks, and a map-figure panel with a ticket-strip header. On desktop the picker pins and scroll steps through the
// projects (snapped); clicking a project scrolls Lenis to its stop, so click and scroll always agree.
// A rail beside the list fills with progress. Phones and reduced motion: no pin, tap to open.
// Skills: the area at the reading line is ink, the rest muted (colour, not opacity, so contrast holds).
// ?demo=1 freezes the skills state for screenshots.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { getLenis } from "@/lib/lenis";
import CloudField from "@/components/story/CloudField";
import type { IconType } from "react-icons";
import { SiDocker, SiFastapi, SiFfmpeg, SiFirebase, SiGreensock, SiIntel, SiLaravel, SiLinux, SiMaplibre, SiNextdotjs, SiNginx, SiOpenstreetmap, SiPostgresql, SiPytest, SiPython, SiReact, SiTypescript, SiVitest, SiWebgl } from "react-icons/si";
import { LobeAntigravity, LobeCodex, SiClaudecode, SiOpencode } from "@/components/aiIcons";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

const label = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";
const pad = (n: number) => String(n).padStart(2, "0");

// Demo projects from scripts/local-content.mjs (years are placeholders).
const projects = [
  { title: "Legislative Records Tracker", summary: "A searchable internal workspace for organizing measures, committee activity, and document history.", category: "Government Technology", stack: ["Next.js", "TypeScript", "PostgreSQL", "Docker"], year: "2026" },
  { title: "Constituent Request Workflow", summary: "A service-request prototype that keeps intake, assignment, follow-ups, and resolution in one understandable flow.", category: "Public Service", stack: ["React", "Node.js", "PostgreSQL", "Tailscale"], year: "2026" },
  { title: "Homelab Operations Console", summary: "A small operations console for checking services, containers, backups, and private-network health at a glance.", category: "Infrastructure", stack: ["Linux", "Docker", "Proxmox", "Tailscale"], year: "2025" },
  { title: "Accessible Component Library", summary: "Reusable interface primitives built around keyboard access, readable states, and consistent light and dark themes.", category: "Frontend Systems", stack: ["React", "TypeScript", "Tailwind CSS"], year: "2024" },
];

// Placeholder copy for the picker (problem / outcome): replace with each project's real story.
const story = [
  { problem: "Make years of committee paperwork findable in seconds, not afternoons.", outcome: "One searchable record replaced scattered folders and spreadsheets.", status: "In use" },
  { problem: "Stop constituent requests from getting lost between intake and follow-up.", outcome: "Every request has an owner, a next step, and a visible history.", status: "Prototype" },
  { problem: "See whether the homelab is healthy without logging into five dashboards.", outcome: "Services, backups, and network health on one quiet screen.", status: "Running" },
  { problem: "Ship interface pieces that work by keyboard and in both themes from day one.", outcome: "Primitives with tested focus states and contrast in light and dark.", status: "Maintained" },
];


const VARIANTS = [["A", "Picker"], ["B", "Gallery"], ["C", "Index"]] as const;

export default function HomeSections() {
  const params = useSearchParams();
  const demo = params.has("demo");
  const variant = VARIANTS.some(([key]) => key === params.get("variant")) ? params.get("variant")! : "A";

  // A new variant brings new pins; re-measure every trigger (CloudField's included) once it has mounted.
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [variant]);

  return (
    <>
      <CloudField id="work" className="projects-stage">
        {variant === "A" && <Projects />}
        {variant === "B" && <Gallery />}
        {variant === "C" && <IndexList />}
      </CloudField>
      <BuildAreas demo={demo} />
      <VariantSwitcher current={variant} />
    </>
  );
}

/** Floating prototype bar: ← variant →, also on the arrow keys. Dev-only route, so never ships. */
function VariantSwitcher({ current }: Readonly<{ current: string }>) {
  const router = useRouter();
  const pathname = usePathname();
  const index = VARIANTS.findIndex(([key]) => key === current);
  const go = (step: number) => router.replace(`${pathname}?variant=${VARIANTS[(index + step + VARIANTS.length) % VARIANTS.length][0]}`, { scroll: false });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#111] p-1 text-xs text-white shadow-2xl ring-1 ring-white/20">
      <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-white/15" onClick={() => go(-1)} aria-label="Previous variant">←</button>
      <span className="px-2 font-semibold">{current} · {VARIANTS[index][1]}</span>
      <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-white/15" onClick={() => go(1)} aria-label="Next variant">→</button>
    </div>
  );
}

/** Each project's mark, typed in glyphs like the cloud: stripes, rings, hatching, quarters. */
const MARKS = ["||||", "(())", "////", "#:#:"];
function AsciiMark({ index, on = false }: Readonly<{ index: number; on?: boolean }>) {
  return <span aria-hidden="true" className="font-mono text-[0.9375rem] font-bold tracking-[-0.04em]" style={{ color: on ? "var(--postcard-orange)" : TONES[index % 4] }}>{MARKS[index % 4]}</span>;
}

function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const pinRef = useRef<ScrollTrigger | null>(null);
  const [selected, setSelected] = useState(0);
  const last = projects.length - 1;

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    // Desktop with motion: pin the picker; scroll steps through the projects, snapping to each one.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const rail = root.querySelector<HTMLElement>("[data-rail]");
      // shortcut: one height check at setup; resizing across 860px keeps the first choice until reload.
      const pinTarget = window.innerHeight >= 860 ? root.querySelector("[data-pinblock]") : root.querySelector("[data-picker]");
      pinRef.current = ScrollTrigger.create({
        trigger: pinTarget,
        start: "top 96px", // just under the ticket header
        end: () => `+=${window.innerHeight * 0.55 * last}`,
        pin: true,
        // Measure this pin before CloudField's triggers, so their range includes the scroll it adds.
        refreshPriority: 1,
        snap: { snapTo: 1 / last, duration: { min: 0.25, max: 0.7 }, ease: "power2.out" },
        onUpdate: (self) => {
          if (rail) rail.style.transform = `scaleY(${self.progress})`;
          const next = Math.round(self.progress * last);
          setSelected((current) => (current === next ? current : next));
        },
      });
      // The list cards rise in as the picker arrives.
      gsap.from(root.querySelectorAll("[data-pick]"), { y: 18, autoAlpha: 0, stagger: 0.07, scrollTrigger: { trigger: root.querySelector("[data-picker]"), start: "top 85%", once: true } });
      return () => { pinRef.current = null; };
    });
    return () => mm.revert();
  }, { scope: ref });

  // Switching projects: the panel's parts slide in and the media wipes open.
  useGSAP(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    root.querySelectorAll("[data-panel]").forEach((panel) => {
      gsap.fromTo(panel.querySelectorAll("[data-panel-part]"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.6, overwrite: true });
    });
  }, { scope: ref, dependencies: [selected] });

  // Click and scroll agree: when pinned, clicking scrolls (smoothly, via Lenis) to that project's stop.
  const choose = (index: number) => {
    const pin = pinRef.current;
    if (!pin) return setSelected(index);
    const y = pin.start + ((pin.end - pin.start) * index) / last;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
      <div ref={ref} className="site-shell">
        <div data-pinblock>
        {/* Title beside the intro, so both fit above the pinned picker. The scrim sits above the cloud
            canvas (z -1) and below the text, so the glyphs fade out behind the words. */}
        <div className="relative grid items-end gap-x-12 gap-y-5 lg:grid-cols-[auto_minmax(0,30rem)]">
          <span aria-hidden="true" className="absolute -inset-x-20 -inset-y-14 z-0 bg-[radial-gradient(farthest-side,var(--background)_62%,color-mix(in_srgb,var(--background)_70%,transparent)_80%,transparent)]" />
          <h2 className="section-title section-title-wide relative z-[1]">A few things <span>I&apos;ve built.</span></h2>
          <p className="body-large site-muted relative z-[1]">I like working on systems where reliability matters. These case studies show how I think, build, and ship.</p>
        </div>

        <div data-picker className="mt-10 grid items-start gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-5">
          <div className="relative lg:pl-6">
            {/* Progress rail: fills as scroll moves through the projects (desktop only). */}
            <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 hidden w-px bg-[var(--line)] lg:block" />
            <span data-rail aria-hidden="true" className="absolute bottom-2 left-0 top-2 hidden w-px origin-top bg-[var(--postcard-orange)] lg:block" style={{ transform: "scaleY(0)" }} />
            <p className={`${label} site-muted mb-3 hidden w-fit bg-[var(--background)] px-2 py-1 lg:block`} aria-live="polite"><span className="text-[var(--accent)]">{pad(selected + 1)}</span> / {pad(projects.length)}</p>
            <ul className="border-t border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--background)_86%,transparent)] backdrop-blur-md" aria-label="Projects">
              {projects.map((p, i) => {
                const on = selected === i;
                return (
                  <li key={p.title} data-pick className="border-b border-[var(--line-strong)]">
                    <button type="button" aria-expanded={on} aria-controls="project-panel" onClick={() => choose(i)}
                      className={`grid w-full grid-cols-[2rem_3.5rem_minmax(0,1fr)_1rem] items-center gap-3 px-4 py-4 text-left transition-colors duration-300 ${on ? "bg-[var(--foreground)] text-[var(--background)]" : "hover:bg-[var(--postcard-paper)]"}`}>
                      <span className={`font-mono text-[0.75rem] font-semibold tabular-nums ${on ? "text-[var(--postcard-orange)]" : "text-[var(--accent)]"}`}>{pad(i + 1)}</span>
                      <AsciiMark index={i} on={on} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.title}</span>
                        <span className={`${label} mt-1 block truncate ${on ? "opacity-70" : "site-muted"}`}>{p.category}</span>
                      </span>
                      <span aria-hidden="true" className={`font-mono transition-opacity ${on ? "opacity-100" : "opacity-0"}`}>▸</span>
                    </button>
                    {/* Phones: the panel opens under the tapped project. */}
                    {on && <div className="pb-3 lg:hidden"><ProjectPanel index={i} /></div>}
                  </li>
                );
              })}
            </ul>
          </div>
          <div id="project-panel" className="hidden lg:block"><ProjectPanel index={selected} /></div>
        </div>
        </div>
      </div>
  );
}

const TONES = ["#ff5a24", "#976e63", "#b2350f", "#64504f"];
const GLYPHS = ".,:;-=+*#%@"; // the same ramp as the cloud shader, sparse to dense
const COLS = 88; // default plate size (Picker and Index)
const ROWS = 12;

/** Density 0-1 for one cell of a project's plate: its mark, drawn large inside a disc. */
function plateDensity(index: number, col: number, row: number, cols = COLS, rows = ROWS) {
  // A wide oval filling most of the plate, so the mark reads as a picture, not an icon.
  const x = (col - cols / 2 + 0.5) / (cols * 0.42);
  const y = (row - rows / 2 + 0.5) / (rows / 2);
  const r = Math.hypot(x, y);
  if (r > 1) return 0;
  const edge = Math.min(1, (1 - r) * 5); // soft rim
  const pattern = [
    0.5 + 0.5 * Math.sin(x * 20), // stripes
    0.5 + 0.5 * Math.cos(r * 16), // rings
    0.5 + 0.5 * Math.sin((x * 2.2 + y) * 6), // hatching
    [1, 0.55, 0.8, 0.35][(x >= 0 ? 1 : 0) + (y >= 0 ? 2 : 0)], // quarters
    // Practice-area symbols for "How I build":
    0.5 + 0.5 * Math.cos((r + 0.05 * Math.sin(Math.atan2(y, x) * 3)) * 20), // 4 maps: wobbly contour rings
    (Math.sin(x * 9) > 0) !== (Math.sin(y * 4.5) > 0) ? 0.95 : 0.3, // 5 product systems: module blocks
    Math.abs(y) < 0.2 + 0.7 * Math.abs(Math.sin(x * 3.1) * Math.cos(x * 7.3)) ? 0.95 - Math.abs(y) * 0.5 : 0.08, // 6 speech: waveform
    Math.max(0.5 + 0.5 * Math.sin((x + y) * 7), 0.5 + 0.5 * Math.sin((x - y) * 7)) * 0.85, // 7 workflow: crossing flows
    Math.floor((y + 1) * 3.5) % 2 ? 0.92 : 0.38, // 8 delivery: stacked layers
  ][index];
  return pattern * edge;
}

/**
 * The panel's visual until real screenshots exist: the project's mark rendered in the cloud's ASCII.
 * On each project change it develops out of noise (GSAP), then a few cells keep flickering like the cloud.
 */
function AsciiPlate({ index, run = true, size = "text-[clamp(6px,0.72vw,10.5px)]", caption = true, cols = COLS, rows = ROWS, bare = false, tone }: Readonly<{ index: number; run?: boolean; size?: string; caption?: boolean; cols?: number; rows?: number; bare?: boolean; tone?: string }>) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = ref.current;
    if (!pre) return;
    const target: string[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const d = plateDensity(index, col, row, cols, rows);
        target.push(d < 0.06 ? " " : GLYPHS[Math.round(d * (GLYPHS.length - 1))]);
      }
    }
    const thresholds = target.map(() => Math.random());
    const draw = (progress: number) => {
      let out = "";
      for (let i = 0; i < target.length; i++) {
        if (i && i % cols === 0) out += "\n";
        out += thresholds[i] < progress ? target[i] : target[i] === " " && Math.random() > 0.15 ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      pre.textContent = out;
    };
    // Not in view (or reduced motion): show the finished plate, no develop or shimmer.
    if (!run || prefersReducedMotion()) {
      draw(1);
      return;
    }
    const state = { progress: 0 };
    const develop = gsap.to(state, { progress: 1, duration: 1.1, ease: "power2.out", onUpdate: () => draw(state.progress) });
    // Afterwards, a few cells shimmer up a step, like the live cloud behind.
    const shimmer = window.setInterval(() => {
      if (develop.isActive()) return;
      const chars = target.slice();
      for (let n = 0; n < 40; n++) {
        const i = (Math.random() * chars.length) | 0;
        const g = GLYPHS.indexOf(chars[i]);
        if (g >= 0) chars[i] = GLYPHS[Math.min(g + 1, GLYPHS.length - 1)];
      }
      let out = "";
      for (let i = 0; i < chars.length; i++) out += (i && i % cols === 0 ? "\n" : "") + chars[i];
      pre.textContent = out;
    }, 160);
    return () => {
      develop.kill();
      window.clearInterval(shimmer);
    };
  }, [index, run, cols, rows]);

  return (
    <figure className={bare ? "contents" : "relative overflow-hidden border-y border-dashed border-[var(--postcard-tear)] bg-[var(--background)] px-3 py-4"}>
      <pre ref={ref} aria-hidden="true" className={`mx-auto w-fit select-none font-mono leading-[1.05] ${size}`} style={{ color: tone ?? TONES[index % 4] }} />
      {caption && <figcaption className={`${label} site-muted mt-3 flex justify-between px-3`}><span>Plate {pad(index + 1)}</span><span>Screenshot goes here</span></figcaption>}
    </figure>
  );
}

function ProjectPanel({ index }: Readonly<{ index: number }>) {
  const p = projects[index];
  const s = story[index];
  return (
    <article data-panel aria-label={p.title} className="rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)]">
      {/* Header as a ticket strip: the figure number on a stub, torn off by a dashed line. */}
      <header className={`${label} flex h-11 items-stretch border-b border-[var(--line)]`}>
        <span className="flex items-center border-r-2 border-dashed border-[var(--postcard-tear)] px-5 text-[var(--postcard-rust)]">Fig. {pad(index + 1)} / {pad(projects.length)}</span>
        <span className="hidden items-center px-5 text-[var(--postcard-muted)] sm:flex">{p.category}</span>
        <span className="ml-auto flex items-center whitespace-nowrap px-5 text-[var(--postcard-muted)]">{p.year} · {s.status}</span>
      </header>
      <div className="px-6 pb-5 pt-6">
        <h3 data-panel-part className="text-[clamp(1.6rem,2.6vw,2.3rem)] font-[620] leading-[0.95] tracking-[-0.035em]">{p.title}<span className="text-[var(--postcard-orange)]">.</span></h3>
        <p data-panel-part className="mt-3 text-[1.0625rem] leading-[1.6] text-[var(--postcard-muted)]">{s.problem}</p>
      </div>
      <AsciiPlate index={index} />
      <dl data-panel-part className="px-6 text-sm">
        <div className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
          <dt className={`${label} pt-0.5 text-[var(--postcard-rust)]`}>Outcome</dt>
          <dd><span className="font-semibold">{s.outcome}</span> <span className="text-[var(--postcard-muted)]">{p.summary}</span></dd>
        </div>
        <div className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
          <dt className={`${label} pt-0.5 text-[var(--postcard-rust)]`}>Stack</dt>
          <dd className="font-mono text-[0.8125rem]">{p.stack.join(" / ")}</dd>
        </div>
        <div className="grid gap-1 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
          <dt className={`${label} pt-0.5 text-[var(--postcard-rust)]`}>Read</dt>
          <dd className="flex flex-wrap gap-x-5 font-semibold">
            <a href="#" className="inline-flex items-center gap-1.5 underline decoration-[var(--postcard-tear)] underline-offset-4 hover:decoration-[var(--postcard-orange)]">Case study<FaArrowRight aria-hidden="true" className="text-[0.75em]" /></a>
            <a href="#" className="inline-flex items-center gap-1.5 underline decoration-[var(--postcard-tear)] underline-offset-4 hover:decoration-[var(--postcard-orange)]">Live site<FaArrowUpRightFromSquare aria-hidden="true" className="text-[0.7em]" /></a>
          </dd>
        </div>
      </dl>
    </article>
  );
}


/** Shared section header: title beside the intro, on a scrim above the cloud canvas and below the text. */
function SectionHeader({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div className={`relative grid items-end gap-x-12 gap-y-5 lg:grid-cols-[auto_minmax(0,30rem)] ${className}`}>
      <span aria-hidden="true" className="absolute -inset-x-20 -inset-y-14 z-0 bg-[radial-gradient(farthest-side,var(--background)_62%,color-mix(in_srgb,var(--background)_70%,transparent)_80%,transparent)]" />
      <h2 className="section-title section-title-wide relative z-[1]">A few things <span>I&apos;ve built.</span></h2>
      <p className="body-large site-muted relative z-[1]">I like working on systems where reliability matters. These case studies show how I think, build, and ship.</p>
    </div>
  );
}

/** The figure details shared by B and C: Outcome / Stack / Read as ruled rows. */
function FigureRows({ index }: Readonly<{ index: number }>) {
  const p = projects[index];
  const s = story[index];
  return (
    <dl className="text-sm">
      <div className="grid gap-1 border-b border-[var(--line)] py-3.5 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
        <dt className={`${label} pt-0.5 text-[var(--postcard-rust)]`}>Outcome</dt>
        <dd><span className="font-semibold">{s.outcome}</span> <span className="text-[var(--postcard-muted)]">{p.summary}</span></dd>
      </div>
      <div className="grid gap-1 border-b border-[var(--line)] py-3.5 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
        <dt className={`${label} pt-0.5 text-[var(--postcard-rust)]`}>Stack</dt>
        <dd className="font-mono text-[0.8125rem]">{p.stack.join(" / ")}</dd>
      </div>
      <div className="grid gap-1 py-3.5 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
        <dt className={`${label} pt-0.5 text-[var(--postcard-rust)]`}>Read</dt>
        <dd className="flex flex-wrap gap-x-5 font-semibold">
          <a href="#" className="inline-flex items-center gap-1.5 underline decoration-[var(--postcard-tear)] underline-offset-4 hover:decoration-[var(--postcard-orange)]">Case study<FaArrowRight aria-hidden="true" className="text-[0.75em]" /></a>
          <a href="#" className="inline-flex items-center gap-1.5 underline decoration-[var(--postcard-tear)] underline-offset-4 hover:decoration-[var(--postcard-orange)]">Live site<FaArrowUpRightFromSquare aria-hidden="true" className="text-[0.7em]" /></a>
        </dd>
      </div>
    </dl>
  );
}

/**
 * Variant B: the section pins and vertical scroll drives a horizontal track. The first slide is the title,
 * then one full-height figure per project. A map scale bar along the bottom fills with progress.
 */
function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const n = projects.length;

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>("[data-track]")!;
    const bar = root.querySelector<HTMLElement>("[data-scale]");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const slides = () => Array.from(track.children) as HTMLElement[];
      // How far the track must move to centre a slide on screen.
      const centred = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2 - root.clientWidth / 2;
      // The pin ends with the last card centred, so it settles before the page moves on.
      const distance = () => centred(slides()[slides().length - 1]);
      // Stops: the title slide where it starts, then each project card centred.
      const points = () => slides().map((el, i) => (i === 0 ? 0 : Math.min(1, Math.max(0, centred(el) / distance()))));
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: (value) => gsap.utils.snap(points(), value), duration: { min: 0.25, max: 0.7 }, ease: "power2.out" },
          onUpdate: (self) => {
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
            const stops = points();
            const nearest = stops.reduce((best, stop, i) => (Math.abs(stop - self.progress) < Math.abs(stops[best] - self.progress) ? i : best), 0);
            const next = nearest - 1; // slide 0 is the title
            setActive((current) => (current === next ? current : next));
          },
        },
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  const slide = "w-full shrink-0 lg:h-[calc(100svh-10.5rem)] lg:w-[min(80vw,66rem)]";
  return (
    <div ref={ref} className="relative py-[clamp(6rem,11vw,9rem)] lg:h-svh lg:overflow-hidden lg:pb-0 lg:pt-[6.5rem]">
      <div data-track className="flex flex-col gap-8 px-4 will-change-transform lg:flex-row lg:gap-10 lg:pl-[max(1rem,calc((100vw-82rem)/2))] lg:pr-[max(1rem,calc((100vw-82rem)/2))]">
        <div className={`${slide} flex flex-col justify-center`}>
          <SectionHeader className="lg:grid-cols-1" />
          <p className={`${label} site-muted relative z-[1] mt-10 hidden lg:block`}>Scroll to travel → {pad(n)} projects</p>
        </div>
        {projects.map((p, i) => <GalleryCard key={p.title} index={i} active={active === i} className={slide} />)}
      </div>

      {/* Progress as a map scale bar: alternating segments, labelled 0 to the last project. */}
      <div aria-hidden="true" className="site-shell absolute inset-x-0 bottom-5 hidden lg:block">
        <div className={`${label} site-muted mb-1.5 flex w-72 justify-between`}><span>0</span><span>{pad(n)}</span></div>
        <div className="relative h-2 w-72">
          <div className="absolute inset-0 border-[1.5px] border-[var(--foreground)] bg-[repeating-linear-gradient(90deg,var(--foreground)_0_12.5%,transparent_12.5%_25%)] opacity-40" />
          <div data-scale className="absolute inset-0 origin-left bg-[var(--postcard-orange)]" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}

/**
 * One Gallery slide, laid out like an atlas page: the picture on the left (the ASCII plate now, a screenshot
 * later), the explanation on the right in reading order: title and problem, what it is, what changed,
 * what it was built with, then the actions.
 */
function GalleryCard({ index, active, className }: Readonly<{ index: number; active: boolean; className: string }>) {
  const p = projects[index];
  const s = story[index];
  const note = `${label} text-[var(--postcard-rust)]`;
  return (
    <article aria-label={p.title} className={`${className} flex flex-col overflow-hidden rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)]`}>
      <header className={`${label} flex h-11 shrink-0 items-stretch border-b border-[var(--line)]`}>
        <span className="flex items-center border-r-2 border-dashed border-[var(--postcard-tear)] px-5 text-[var(--postcard-rust)]">Fig. {pad(index + 1)} / {pad(projects.length)}</span>
        <span className="hidden items-center px-5 text-[var(--postcard-muted)] sm:flex">{p.category}</span>
        <span className="ml-auto flex items-center whitespace-nowrap px-5 text-[var(--postcard-muted)]">{p.year} · {s.status}</span>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* The picture: the plate fills the column; one caption bar along the bottom. */}
        <figure className="flex min-h-0 flex-col border-b border-dashed border-[var(--postcard-tear)] bg-[var(--background)] lg:border-b-0 lg:border-r-2">
          <div className="grid flex-1 place-items-center overflow-hidden px-4 py-6">
            <AsciiPlate index={index} run={active} bare caption={false} cols={76} rows={38} size="text-[clamp(5px,min(1.02vh,0.56vw),11px)]" />
          </div>
          <figcaption className={`${label} flex shrink-0 justify-between gap-4 border-t border-[var(--line)] px-5 py-3 text-[var(--postcard-muted)]`}>
            <span className="truncate">Plate {pad(index + 1)} · {p.title}</span>
            <span className="whitespace-nowrap">Screenshot pending</span>
          </figcaption>
        </figure>

        {/* The explanation, top to bottom. */}
        <div className="flex min-h-0 flex-col px-7 py-6">
          <h3 className="text-[clamp(1.8rem,2.8vw,2.7rem)] font-[620] leading-[0.95] tracking-[-0.035em]">{p.title}<span className="text-[var(--postcard-orange)]">.</span></h3>
          <p className="mt-3 text-[1.0625rem] leading-[1.55] text-[var(--postcard-muted)]">{s.problem}</p>

          <dl className="mt-5 grid gap-4 border-t border-[var(--line)] pt-5 text-[0.9375rem] leading-[1.55]">
            {/* On short screens the problem line already says what it is. */}
            <div className="[@media(max-height:860px)]:hidden"><dt className={note}>What it is</dt><dd className="mt-1.5">{p.summary}</dd></div>
            <div><dt className={note}>What changed</dt><dd className="mt-1.5 font-semibold text-[var(--postcard-rust)]">{s.outcome}</dd></div>
            <div>
              <dt className={note}>Built with</dt>
              <dd className="mt-2"><ul className="grid grid-cols-2 gap-x-6 font-mono text-[0.8125rem]">{p.stack.map((tool) => <li key={tool} className="border-b border-dashed border-[var(--line)] py-1">{tool}</li>)}</ul></dd>
            </div>
          </dl>

          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <a href="#" className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[var(--postcard-ink)] px-4 text-sm font-semibold text-[var(--postcard-paper)]">Read the case study<FaArrowRight aria-hidden="true" className="text-[0.75em]" /></a>
            <a href="#" className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--postcard-ink)] px-4 text-sm font-semibold">Live site<FaArrowUpRightFromSquare aria-hidden="true" className="text-[0.7em]" /></a>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Variant C: a big typographic index, no pinning. Rules draw in and titles rise as rows enter. On desktop,
 * hovering a project floats its ASCII plate beside the cursor (GSAP quickTo); the other rows mute.
 */
function IndexList() {
  const ref = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [shown, setShown] = useState(0); // last hovered, so the plate doesn't blank while fading out

  useGSAP(() => {
    const root = ref.current;
    const float = floatRef.current;
    if (!root || !float || prefersReducedMotion()) return;
    root.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } })
        .from(row.querySelector("[data-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 1 })
        .from(row.querySelector("[data-rise]"), { yPercent: 110, duration: 0.9 }, 0.1)
        .from(row.querySelectorAll("[data-cell]"), { autoAlpha: 0, y: 8, stagger: 0.05 }, 0.25);
    });
    const xTo = gsap.quickTo(float, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.55, ease: "power3" });
    const move = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      xTo(Math.min(event.clientX - bounds.left + 28, bounds.width - float.offsetWidth));
      yTo(event.clientY - bounds.top - float.offsetHeight / 2);
    };
    root.addEventListener("pointermove", move);
    return () => root.removeEventListener("pointermove", move);
  }, { scope: ref });

  const enter = (i: number) => {
    setHover(i);
    setShown(i);
  };

  return (
    <div ref={ref} className="site-shell relative">
      <SectionHeader />
      <ol className="mt-16 border-b border-[var(--line-strong)]" onPointerLeave={() => setHover(null)}>
        {projects.map((p, i) => {
          const dim = hover !== null && hover !== i;
          return (
            <li key={p.title} data-row className="relative" onPointerEnter={() => enter(i)}>
              <span data-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line-strong)]" />
              <a href="#" onFocus={() => enter(i)} onBlur={() => setHover(null)} className={`relative grid grid-cols-[2rem_3.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-3 bg-[color-mix(in_srgb,var(--background)_80%,transparent)] py-6 backdrop-blur-sm transition-colors duration-300 lg:grid-cols-[3rem_4.5rem_minmax(0,1fr)_14rem] ${dim ? "text-[var(--muted)]" : ""}`}>
                <span data-cell className={`font-mono text-[0.75rem] font-semibold tabular-nums ${dim ? "" : "text-[var(--accent)]"}`}>{pad(i + 1)}</span>
                <span data-cell><AsciiMark index={i} on={hover === i} /></span>
                <span className="block overflow-hidden">
                  <span data-rise className="block">
                    <span className={`block text-[clamp(1.6rem,3.6vw,3rem)] font-[620] leading-[1.02] tracking-[-0.035em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${hover === i ? "translate-x-3" : ""}`}>
                      {p.title}<span className={`text-[var(--postcard-orange)] transition-opacity ${hover === i ? "opacity-100" : "opacity-0"}`}>.</span>
                    </span>
                  </span>
                </span>
                <span data-cell className={`${label} col-start-3 lg:col-start-auto lg:text-right ${dim ? "" : "site-muted"}`}>{p.category} · {p.year}</span>
              </a>
              {/* Phones and touch: the details sit inline, since there is no hover. */}
              <div className="pb-6 pl-[calc(2rem+3.5rem+2rem)] lg:hidden">
                <p className="site-muted text-[0.9375rem] leading-[1.6]">{story[i].problem}</p>
                <FigureRows index={i} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* The floating plate: follows the cursor while a project is hovered (desktop only). */}
      <div ref={floatRef} aria-hidden="true" className={`pointer-events-none absolute left-0 top-0 z-20 hidden w-[24rem] rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)] transition-[opacity,scale] duration-300 lg:block ${hover === null ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}>
        <div className={`${label} flex h-9 items-stretch border-b border-[var(--line)]`}>
          <span className="flex items-center border-r-2 border-dashed border-[var(--postcard-tear)] px-4 text-[var(--postcard-rust)]">Fig. {pad(shown + 1)}</span>
          <span className="ml-auto flex items-center px-4 text-[var(--postcard-muted)]">{story[shown].status}</span>
        </div>
        <AsciiPlate index={shown} run={hover !== null} size="text-[6.4px]" caption={false} />
        <p className="px-4 py-3 text-sm leading-[1.5]">{story[shown].problem}</p>
      </div>
    </div>
  );
}

// Copied from TechnologyStack.tsx (practiceAreas + toolkit) so the prototype leaves that file untouched.
const AREAS: ReadonlyArray<{ name: string; description: string; tools: ReadonlyArray<[string, IconType]> }> = [
  { name: "Maps and spatial data", description: "Reshaped a mapping platform: a vector basemap on our own tiles, point-in-polygon checks against barangay boundaries, and road-graph routing.", tools: [["MapLibre", SiMaplibre], ["OpenStreetMap", SiOpenstreetmap], ["WebGL", SiWebgl], ["Firebase", SiFirebase]] },
  { name: "Product systems", description: "Interfaces, APIs and data models together, from React field tools and this Next.js publishing system to a Laravel booking platform built for concurrent bookings.", tools: [["TypeScript", SiTypescript], ["React", SiReact], ["Next.js", SiNextdotjs], ["PostgreSQL", SiPostgresql], ["Laravel", SiLaravel], ["GSAP", SiGreensock]] },
  { name: "Speech and applied AI", description: "Local-first transcription for live streams and broadcasts, and computer-vision pipelines tuned for constrained hardware.", tools: [["Python", SiPython], ["FastAPI", SiFastapi], ["FFmpeg", SiFfmpeg], ["OpenVINO", SiIntel]] },
  { name: "AI-assisted workflow", description: "Pairing with Claude Code and OpenCode on real codebases every day; worked with Codex and Antigravity.", tools: [["Claude Code", SiClaudecode], ["OpenCode", SiOpencode], ["Codex", LobeCodex], ["Antigravity", LobeAntigravity]] },
  { name: "Delivery and assurance", description: "Self-hosted in containers behind Nginx, with tests at every layer from pytest and Vitest to browser checks.", tools: [["Docker", SiDocker], ["Linux", SiLinux], ["Nginx", SiNginx], ["pytest", SiPytest], ["Vitest", SiVitest]] },
];

const TOOLKIT: ReadonlyArray<[string, readonly string[]]> = [
  ["Languages", ["TypeScript", "JavaScript", "Python", "PHP", "C#", "Java", "C++", "C", "SQL", "Bash", "HTML", "CSS", "Assembly"]],
  ["Frontend", ["React", "Next.js", "Vite", "Tailwind CSS", "GSAP", "Framer Motion", "TanStack Query", "Zustand", "Mantine", "React Aria", "Recharts"]],
  ["Maps and 3D", ["MapLibre GL", "deck.gl", "OpenStreetMap", "PMTiles", "Planetiler", "tippecanoe", "Turf.js", "WebGL"]],
  ["Backend and APIs", ["Node.js", "FastAPI", "Laravel", "Prisma", "SQLAlchemy", "Alembic", "Auth.js", "Firebase", "Stripe", "WebSockets", "MQTT", ".NET Framework (WinForms)"]],
  ["Data", ["PostgreSQL", "SQLite", "Redis", "Firestore", "pandas", "NumPy", "Jupyter", "Kaggle"]],
  ["AI, vision and speech", ["YOLO (Ultralytics)", "PaddleOCR", "OpenVINO", "ONNX Runtime", "OpenCV", "BoxMOT", "faster-whisper", "pyannote.audio", "Hugging Face", "scikit-learn", "Tesseract.js", "FFmpeg", "yt-dlp"]],
  ["AI coding tools", ["Claude Code", "OpenCode", "Codex", "Antigravity"]],
  ["Infrastructure", ["Docker", "Docker Compose", "Linux", "Nginx", "GitHub Actions", "Cloudflare Tunnel", "Tailscale", "Git", "uv"]],
  ["Testing and quality", ["Vitest", "Playwright", "pytest", "Pest", "PHPUnit", "ESLint", "Prettier", "mypy", "axe-core", "SonarQube"]],
];
const TOOL_COUNT = TOOLKIT.reduce((n, [, tools]) => n + tools.length, 0);

/**
 * "How I build" as a spec sheet a recruiter can scan: five area cards with recognisable tool logos, then
 * the full toolkit as a plain ledger. Motion: cards rise in, their logos follow; logos turn orange on hover.
 */
function BuildAreas({ demo }: Readonly<{ demo: boolean }>) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const root = ref.current;
    if (!root || demo || prefersReducedMotion()) return;
    root.querySelectorAll<HTMLElement>("[data-area]").forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: "top 88%", once: true } })
        .from(card, { y: 28, autoAlpha: 0, duration: 0.8, delay: (i % 3) * 0.08 })
        .from(card.querySelectorAll("[data-tool]"), { y: 10, autoAlpha: 0, stagger: 0.04, duration: 0.5 }, 0.25);
    });
    root.querySelectorAll<HTMLElement>("[data-ledger-row]").forEach((row) => {
      gsap.from(row, { autoAlpha: 0, y: 10, duration: 0.6, scrollTrigger: { trigger: row, start: "top 92%", once: true } });
    });
  }, { scope: ref, dependencies: [demo] });

  // Maps and product systems lead (wider), the other three share the second row.
  const spans = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];
  return (
    <section ref={ref} className="technology-stage border-t border-[var(--line)] py-[clamp(5.5rem,10vw,8rem)]" aria-labelledby="build-heading">
      <div className="site-shell">
        <div className="grid items-end gap-x-12 gap-y-5 lg:grid-cols-[auto_minmax(0,30rem)] lg:justify-between">
          <div>
            <h2 id="build-heading" className="section-title">How I build.</h2>
            <p className={`${label} site-muted mt-4`}><span className="text-[var(--accent)]">{pad(AREAS.length)}</span> areas · <span className="text-[var(--accent)]">{TOOL_COUNT}</span> tools, all used in real repositories</p>
          </div>
          <p className="body-large site-muted">The tools I reach for, grouped by the problem they help me solve. Each project page carries its full implementation stack.</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {AREAS.map((area, i) => (
            <article key={area.name} data-area aria-labelledby={`area-${i}`} className={`${spans[i]} flex flex-col rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)]`}>
              <header className={`${label} flex h-11 items-stretch border-b border-[var(--line)]`}>
                <span className="flex items-center border-r-2 border-dashed border-[var(--postcard-tear)] px-5 text-[var(--postcard-rust)]">{pad(i + 1)}</span>
                <h3 id={`area-${i}`} className="flex min-w-0 items-center truncate px-5">{area.name}</h3>
                <span className="ml-auto flex items-center whitespace-nowrap px-5 text-[var(--postcard-muted)]">{pad(area.tools.length)} tools</span>
              </header>
              {/* Columns chosen so rows come out even; a lone last tool spans the row instead of leaving a gap. */}
              <ul className={`grid gap-px bg-[var(--line)] [&>li:last-child:nth-child(odd)]:col-span-2 ${area.tools.length === 6 ? "grid-cols-2 sm:grid-cols-3 sm:[&>li:last-child:nth-child(odd)]:col-span-1" : "grid-cols-2"}`}>
                {area.tools.map(([name, Icon]) => (
                  <li key={name} data-tool className="group flex items-center gap-3 bg-[var(--postcard-paper)] px-5 py-4">
                    <Icon aria-hidden="true" className="size-6 shrink-0 transition-colors duration-300 group-hover:text-[var(--postcard-orange)]" />
                    <span className="truncate font-semibold">{name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-[var(--line)] px-5 py-4 text-sm leading-[1.55] text-[var(--postcard-muted)]">{area.description}</p>
            </article>
          ))}
        </div>

        {/* Everything, in plain text: easy to scan, and findable with Ctrl+F. */}
        <div className="mt-16">
          <h3 className={`${label} border-b border-[var(--line-strong)] pb-3`}>Full toolkit · <span className="text-[var(--accent)]">{TOOL_COUNT}</span></h3>
          <dl>
            {TOOLKIT.map(([group, tools]) => (
              <div key={group} data-ledger-row className="grid gap-x-10 gap-y-1 border-b border-[var(--line)] py-3.5 md:grid-cols-[14rem_minmax(0,1fr)]">
                <dt className={`${label} pt-0.5 text-[var(--accent)]`}>{group}</dt>
                <dd className="text-[0.9375rem] leading-[1.6]">{tools.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
