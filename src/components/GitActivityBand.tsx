"use client";

import { useRef, useState } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { SiGithub } from "react-icons/si";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import activity from "@/lib/gitActivity.json";
import { siteConfig } from "@/lib/seo";

const CELL = 10;
const SPLIT_DOTS = 50;
const label = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";
const number = (n: number) => n.toLocaleString("en-US");
const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Day `index` of the year as a grid cell: one column per week, Sunday on top, like GitHub's own calendar. */
export function cellOf(index: number, firstWeekday: number) {
  const position = firstWeekday + index;
  return { column: Math.floor(position / 7), row: position % 7 };
}

/** Halftone radius: square-root scale so one heavy day doesn't shrink every other dot to a speck. */
export function radiusOf(count: number, max: number) {
  return count === 0 ? 0.9 : 1.6 + 2.8 * Math.sqrt(count / max);
}

/**
 * A year of GitHub contributions as a halftone dot screen, with the private share stated outright.
 * Day counts include private work; GitHub never says what it was, and neither does this.
 */
export default function GitActivityBand() {
  // A snapshot written by `npm run stats:refresh`, so the page never waits on GitHub or needs a token.
  const { asOf, counts, start, total, privateCount, mergedPrs, privatePrs, repos } = activity;
  const startDate = new Date(`${start}T00:00:00Z`);
  const firstWeekday = startDate.getUTCDay();
  const columns = cellOf(counts.length - 1, firstWeekday).column + 1;
  const max = Math.max(...counts, 1);
  const busiest = counts.indexOf(max);
  const activeDays = counts.filter(Boolean).length;
  const privateShare = Math.round((privateCount / Math.max(total, 1)) * 100);
  const privateDots = Math.round((privateShare / 100) * SPLIT_DOTS);

  const [pointed, setPointed] = useState<number | null>(null);
  const shown = pointed ?? busiest;
  const dateOf = (index: number) => dayFormat.format(new Date(startDate.getTime() + index * 86_400_000));

  const svgRef = useRef<SVGSVGElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const timeline = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 80%", once: true } });
      // The press-sheet print-in from the admin desk's DotsReveal: one clip tween, not one per dot.
      timeline.fromTo(root.querySelector("[data-dots]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power2.out", clearProps: "clipPath" });
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((element) => {
        const target = Number(element.dataset.count);
        const counter = { value: 0 };
        timeline.to(counter, { value: target, duration: 1.2, ease: "power2.out", onUpdate: () => { element.textContent = number(Math.round(counter.value)); } }, 0.2);
      });
      timeline.fromTo(root.querySelector("[data-private-bar]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.out", clearProps: "clipPath" }, 0.3);
    },
    { scope: ref },
  );

  const pointAt = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM()?.inverse();
    if (!svg || !matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    const index = Math.floor(point.x / CELL) * 7 + Math.floor(point.y / CELL) - firstWeekday;
    setPointed(index >= 0 && index < counts.length ? index : null);
  };

  // Two short label lines each, so the four cells line up on a phone; `accent` marks the private share.
  const figures = [
    { value: total, text: "Contributions", sub: "Last 12 months" },
    { value: mergedPrs, text: "PRs merged", sub: `${number(privatePrs)} private`, accent: true },
    { value: repos, text: "Repositories", sub: "Last 12 months" },
    { value: Math.round(total / (counts.length / 7)), text: "Per week", sub: "On average" },
  ];

  return (
    <article
      ref={ref}
      aria-labelledby="git-activity-heading"
      className="mt-5 rounded-[2px] bg-[var(--postcard-paper)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)]"
      data-area
    >
      <header className={`${label} flex h-11 items-stretch border-b border-[var(--line)]`}>
        <span className="flex items-center border-r-2 border-dashed border-[var(--postcard-tear)] px-5 text-[var(--postcard-rust)]">
          <SiGithub aria-hidden="true" className="size-4" />
        </span>
        <h3 className="flex min-w-0 items-center truncate px-5" id="git-activity-heading">
          Shipping record
        </h3>
        <a
          aria-label="GitHub profile (opens in a new tab)"
          className="ml-auto flex items-center gap-2 whitespace-nowrap px-5 text-[var(--postcard-muted)] transition-colors hover:text-[var(--postcard-orange)]"
          href={siteConfig.github}
          rel="noreferrer"
          target="_blank"
        >
          <span className="max-sm:hidden">{siteConfig.github.replace("https://", "")}</span>
          <FaArrowUpRightFromSquare aria-hidden="true" />
        </a>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 px-5 py-6 lg:border-r lg:border-[var(--line)]">
          {/* Phones keep the latest 26 weeks: the slice crops the oldest weeks off the left. */}
          <div className="aspect-[26/7] sm:[aspect-ratio:var(--columns)/7]" data-dots style={{ "--columns": columns } as React.CSSProperties}>
            <svg
              ref={svgRef}
              aria-label={`${number(total)} contributions over the last 12 months, on ${activeDays} days. The busiest day was ${dateOf(busiest)}, with ${max}.`}
              className="block size-full touch-pan-y"
              onPointerDown={pointAt}
              onPointerLeave={() => setPointed(null)}
              onPointerMove={pointAt}
              preserveAspectRatio="xMaxYMid slice"
              role="img"
              viewBox={`0 0 ${columns * CELL} ${7 * CELL}`}
            >
              {counts.map((count, index) => {
                const { column, row } = cellOf(index, firstWeekday);
                let fill = "var(--postcard-ink)";
                if (index === shown) fill = "var(--postcard-orange)";
                else if (count === 0) fill = "var(--line-strong)";
                return <circle cx={column * CELL + CELL / 2} cy={row * CELL + CELL / 2} fill={fill} key={start + index} r={radiusOf(count, max)} />;
              })}
              {(() => {
                // A ring marks the shown day, so an empty one is findable too.
                const { column, row } = cellOf(shown, firstWeekday);
                return <circle cx={column * CELL + CELL / 2} cy={row * CELL + CELL / 2} fill="none" r={4.6} stroke="var(--postcard-orange)" strokeWidth={0.8} />;
              })()}
            </svg>
          </div>
          <p className={`${label} mt-4 flex flex-wrap justify-between gap-x-6 gap-y-1 text-[var(--postcard-muted)]`}>
            <span>
              {pointed === null ? "Busiest day · " : ""}
              {dateOf(shown)} · <span className="text-[var(--postcard-ink)]">{counts[shown]}</span>
            </span>
            <span>{activeDays} active days · as of {dayFormat.format(new Date(`${asOf}T00:00:00Z`))}</span>
          </p>

          <div className="mt-7 border-t border-[var(--line)] pt-5">
            <div className="flex items-end justify-between gap-4">
              <p className="text-[var(--postcard-rust)]">
                <span className={`${label} block`}>Private · {privateShare}%</span>
                <span className="mt-1 block text-2xl font-semibold leading-none tabular-nums">{number(privateCount)}</span>
              </p>
              <p className="text-right">
                <span className={`${label} block text-[var(--postcard-muted)]`}>Public · {100 - privateShare}%</span>
                <span className="mt-1 block text-2xl font-semibold leading-none tabular-nums">{number(total - privateCount)}</span>
              </p>
            </div>
            {/* The split as one halftone row: each dot is 2% of the year's contributions. */}
            <div aria-hidden="true" className="mt-3 flex justify-between" data-private-bar>
              {Array.from({ length: SPLIT_DOTS }, (_, index) => (
                <span
                  className={`size-[5px] rounded-full sm:size-2 ${index < privateDots ? "bg-[var(--postcard-rust)]" : "bg-[var(--postcard-ink)]"}`}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px border-t border-[var(--line)] bg-[var(--line)] lg:border-t-0">
          {figures.map((figure) => (
            <div className="flex flex-col-reverse justify-center gap-2 bg-[var(--postcard-paper)] px-5 py-5" data-tool key={figure.text}>
              <dt className={label}>
                {figure.text}
                <span className={`mt-0.5 block ${figure.accent ? "text-[var(--postcard-rust)]" : "text-[var(--postcard-muted)]"}`}>{figure.sub}</span>
              </dt>
              <dd className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-none tracking-[-0.03em] tabular-nums" data-count={figure.value}>
                {number(figure.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
