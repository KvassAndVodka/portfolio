"use client";
// PROTOTYPE variant D, "Postcard desk": the admin in the public site's identity (DESIGN.md).
// Ticket-strip header, cream paper, Geist Mono labels, rust indices, plain hairline lists.
// The editor is a sheet of postcard paper; publishing is a Medium-style preview and settings page.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaFileLines, FaGripVertical, FaHouse, FaImages, FaLaptopCode, FaPlus } from "react-icons/fa6";
import LocalTime from "@/components/LocalTime";
import ThemeToggle from "@/components/ThemeToggle";
import VisitorCountryMap from "@/components/admin/VisitorCountryMap";
import { dailyVisits, draftBody, media, notes, projects, stats, topPages, trash, visitorCountries, type PageKey, type Status } from "./sample-data";

const href = (page: PageKey) => `?variant=D&page=${page}`;
const label = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";
const index = "font-mono text-[0.75rem] font-semibold text-[var(--accent)] tabular-nums";
const display = "font-[620] leading-[0.95] tracking-[-0.035em]";
const inkButton = "inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] hover:opacity-90";
const lineButton = "inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--foreground)] px-4 text-sm font-semibold hover:bg-[var(--surface)]";
const nav: Array<[PageKey, string]> = [["dashboard", "Desk"], ["notes", "Notes"], ["projects", "Projects"], ["media", "Media"], ["trash", "Trash"], ["settings", "Settings"]];
const pad = (n: number) => String(n).padStart(2, "0");
const statusColor: Record<Status, string> = { PUBLISHED: "text-[var(--admin-success)]", SCHEDULED: "text-[var(--accent)]", DRAFT: "site-muted" };

export default function VariantD({ page }: Readonly<{ page: PageKey }>) {
  if (page === "write") return <Write />;
  return (
    <div className="min-h-dvh bg-[var(--background)] pb-28 text-[var(--foreground)] md:pb-16">
      <header className="site-header sticky top-0 z-30">
        <div className="header-inner site-shell flex h-full items-center justify-between">
          <Link className="brand-lockup" href={href("dashboard")} aria-label="Admin desk"><strong aria-hidden="true">JR<span className="brand-dot">.</span></strong></Link>
          <span className={`${label} site-muted ml-5 mr-auto hidden lg:inline`}>Admin</span>
          <nav aria-label="Admin" className="primary-navigation relative hidden items-center md:flex">
            {nav.map(([p, text]) => (
              <Link key={p} href={href(p)} aria-current={page === p ? "page" : undefined} className={`primary-nav-link ${page === p ? "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-[var(--postcard-orange)]" : ""}`}>
                <span className="primary-nav-label"><span>{text}</span><span aria-hidden="true">{text}</span></span>
              </Link>
            ))}
            <Link href={href("write")} className="primary-nav-link primary-nav-contact"><span className="primary-nav-label"><span>Write</span><span aria-hidden="true">Write</span></span></Link>
            <span className="header-theme-toggle"><ThemeToggle /></span>
          </nav>
          <div className="flex items-center gap-2 pr-1.5 md:hidden"><span className="header-theme-toggle"><ThemeToggle /></span></div>
        </div>
      </header>

      <main className="site-shell">
        {page === "dashboard" && <Desk />}
        {page === "notes" && <Notes />}
        {page === "projects" && <Projects />}
        {page === "media" && <Media />}
        {page === "trash" && <Trash />}
        {page === "settings" && <Settings />}
      </main>

      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--line)] bg-[var(--postcard-paper)] md:hidden">
        {([["dashboard", FaHouse, "Desk"], ["notes", FaFileLines, "Notes"], ["write", FaPlus, "Write"], ["projects", FaLaptopCode, "Projects"], ["media", FaImages, "Media"]] as const).map(([p, Icon, text]) => (
          <Link key={p} href={href(p)} aria-current={page === p ? "page" : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1.5 ${label} !text-[0.625rem] ${p === "write" ? "bg-[var(--postcard-orange)] text-[var(--postcard-on-orange)]" : page === p ? "" : "site-muted"}`}>
            <Icon aria-hidden="true" className="text-base" />{text}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// shortcut: copied from StoryJourney's CONTOUR_RINGS; export it from there when this leaves the prototype.
const CONTOUR_RINGS = Array.from({ length: 9 }, (_, level) => {
  const radius = 34 * (level + 1);
  const points = Array.from({ length: 72 }, (_, step) => {
    const angle = (step / 72) * Math.PI * 2;
    const wobble = 1 + 0.16 * Math.sin(2 * angle + 0.6) + 0.08 * Math.sin(3 * angle + 1.9) + 0.05 * Math.sin(5 * angle + 0.3);
    return `${(150 + radius * wobble * Math.cos(angle) * 1.25).toFixed(1)} ${(250 + radius * wobble * Math.sin(angle)).toFixed(1)}`;
  });
  return `M${points.join("L")}Z`;
});

/** The home page's orange panel, reused as the desk's field card: contours, coordinates, north arrow, scale bar. */
function FieldCard() {
  return (
    <aside aria-label="This week" className="relative min-h-[19rem] overflow-hidden rounded-[2px] bg-[var(--postcard-orange)] text-[var(--postcard-on-orange)] shadow-[var(--postcard-shadow)]">
      <svg className="postcard-contours" viewBox="0 0 470 564" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        {CONTOUR_RINGS.map((ring, i) => <path d={ring} key={ring} strokeWidth={i % 5 === 4 ? 2 : 1.2} />)}
      </svg>
      <p className="postcard-place">Cagayan de Oro</p>
      <p className="postcard-figure">FIG. 01 — 08°29′N 124°41′E</p>
      <div className="absolute right-5 top-5 z-[2] text-right font-mono text-[0.75rem] font-semibold"><LocalTime /></div>
      <dl className="absolute inset-x-[1.375rem] bottom-[4.75rem] z-[2] grid grid-cols-3 gap-3">
        {[["Week", "46"], ["Drafts in", "02"], ["Going out", "01"]].map(([l, v]) => <div key={l}><dt className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em]">{l}</dt><dd className={`text-[2.6rem] tabular-nums ${display}`}>{v}</dd></div>)}
      </dl>
      <div className="postcard-legend" aria-hidden="true">
        <span className="postcard-north">N<svg viewBox="0 0 18 26"><path d="M9 0L18 26L9 19L0 26Z" /></svg></span>
        <span className="postcard-scale"><span><span>0</span><span>1 km</span></span><span className="postcard-scale-bar" /></span>
      </div>
    </aside>
  );
}

/** A postmark means the note went out: a cancel ring with place and date, plus wavy cancel lines. Postdated when scheduled. */
function Postmark({ date, postdated }: Readonly<{ date: string; postdated?: boolean }>) {
  const id = `pm-${date.replace(" ", "")}`;
  return (
    <svg viewBox="0 0 168 80" className="h-[4.5rem] w-[9.5rem] shrink-0 -rotate-6 text-[var(--accent)]" role="img" aria-label={postdated ? `Scheduled for ${date}` : `Published ${date}`}>
      <defs><path id={id} d="M40 40 m-29 0 a29 29 0 1 1 58 0 a29 29 0 1 1 -58 0" /></defs>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray={postdated ? "4 3" : undefined}>
        <circle cx="40" cy="40" r="37" /><circle cx="40" cy="40" r="23" />
      </g>
      <text fontFamily="var(--font-geist-mono), monospace" fontSize="7.2" fontWeight="700" letterSpacing="0.8" fill="currentColor"><textPath href={`#${id}`} startOffset="25%" textAnchor="middle">{postdated ? "POSTDATED · CDO" : "CAGAYAN DE ORO"}</textPath></text>
      <text x="40" y="40" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="9.5" fontWeight="700" fill="currentColor">{date}</text>
      <text x="40" y="51" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="7.5" fill="currentColor">2026</text>
      {!postdated && <g fill="none" stroke="currentColor" strokeWidth="1.6">{[22, 32, 42, 52, 62].map((y) => <path key={y} d={`M84 ${y} q10 -5 20 0 t20 0 t20 0 t20 0`} />)}</g>}
    </svg>
  );
}

/** The existing admin map, re-inked with the site palette instead of the admin greys. */
const paperMap = { "--admin-surface": "var(--surface-raised)", "--admin-border": "var(--line)", "--admin-muted": "var(--muted)", "--admin-map-water": "var(--surface)", "--admin-map-land": "var(--line)", "--admin-map-border": "var(--surface-raised)" } as React.CSSProperties;

function PageHead({ kicker, title, lead, children }: Readonly<{ kicker: string; title: string; lead?: string; children?: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-6 border-b border-[var(--line)] pb-10 pt-14 md:flex-row md:items-end md:justify-between md:pt-20">
      <div>
        <p className={`${label} text-[var(--accent)]`}>{kicker}</p>
        <h1 className={`mt-4 text-[clamp(2.65rem,6.2vw,5.5rem)] ${display}`}>{title}<span className="text-[var(--postcard-orange)]">.</span></h1>
        {lead && <p className="site-muted mt-5 max-w-[42rem] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.7]">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

function SectionLabel({ children, count }: Readonly<{ children: string; count?: number }>) {
  return <h2 className={`${label} flex items-center gap-2 pb-4`}>{children}{count !== undefined && <span className="text-[var(--accent)]">{pad(count)}</span>}</h2>;
}

function Desk() {
  const max = Math.max(...dailyVisits);
  const waiting = notes.filter((n) => n.fromPipeline);
  return (
    <>
      <div className="grid items-end gap-10 border-b border-[var(--line)] pb-12 pt-14 md:pt-20 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div>
          <p className={`${label} text-[var(--accent)]`}>Fig. 01 · Thu 12 Nov 2026</p>
          <h1 className={`mt-4 text-[clamp(2.65rem,6.2vw,5.5rem)] ${display}`}>Good afternoon, Javier<span className="text-[var(--postcard-orange)]">.</span></h1>
          <p className="site-muted mt-5 max-w-[38rem] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.7]">Two weekly drafts arrived from your notes on Sunday. Review them, then send what is ready.</p>
          <div className="mt-8 flex flex-wrap gap-2"><Link href={href("write")} className={inkButton}>Start a note</Link><Link href="/" className={lineButton}>View site</Link></div>
        </div>
        <FieldCard />
      </div>

      <div className="grid gap-x-16 gap-y-14 py-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section>
          <SectionLabel count={waiting.length}>Waiting for review</SectionLabel>
          <ul className="space-y-4">
            {waiting.map((n) => (
              <li key={n.title} className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-raised)] p-6">
                <p className={`${label} site-muted`}>From weekly notes · Sun 08 Nov · {n.minutes} min</p>
                <Link href={href("write")} className={`mt-3 block text-[clamp(1.45rem,2.4vw,2.15rem)] hover:text-[var(--accent)] ${display}`}>{n.title}</Link>
                <p className="site-muted mt-3 leading-[1.7]">{n.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2"><Link href={href("write")} className={inkButton}>Review and edit</Link><button type="button" className={lineButton}>Discard</button></div>
              </li>
            ))}
          </ul>

          <div className="mt-14"><SectionLabel>Recently edited</SectionLabel></div>
          <ol className="border-t border-[var(--line)]">
            {notes.slice(2).map((n, i) => (
              <li key={n.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--line)] py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]">
                <span className={index}>{pad(i + 1)}</span>
                <Link href={href("write")} className="font-semibold hover:text-[var(--accent)]">{n.title}</Link>
                <span className={`${label} col-start-2 whitespace-nowrap sm:col-start-auto sm:text-right ${statusColor[n.status]}`}>{n.status.toLowerCase()} · {n.edited}</span>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-14">
          <section>
            <SectionLabel>Last 30 days</SectionLabel>
            <dl className="grid grid-cols-3 border-y border-[var(--line)]">
              {[["Views", stats.views, `+${stats.viewsChange}%`], ["Visitors", stats.visitors, `${stats.visitorsChange}%`], ["Messages", stats.contacts, "new"]].map(([l, v, c]) => (
                <div key={l} className="border-r border-[var(--line)] py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4"><dt className={`${label} site-muted`}>{l}</dt><dd className={`mt-2 text-[1.75rem] tabular-nums ${display}`}>{Number(v).toLocaleString()}</dd><dd className="site-muted mt-1 font-mono text-[0.75rem]">{c}</dd></div>
              ))}
            </dl>
            <div aria-label="Daily views, last 14 days" className="mt-6 flex h-20 items-end gap-[3px]">{dailyVisits.map((v, i) => <span key={i} className={`flex-1 ${i === dailyVisits.length - 1 ? "bg-[var(--postcard-orange)]" : "bg-[var(--line)]"}`} style={{ height: `${(v / max) * 100}%` }} />)}</div>
            <p className={`${label} site-muted mt-2 flex justify-between`}><span>30 Oct</span><span>Today</span></p>
          </section>
          <section>
            <SectionLabel>Most read</SectionLabel>
            <ol className="border-t border-[var(--line)]">{topPages.map((p, i) => <li key={p.path} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-3 border-b border-[var(--line)] py-3 text-sm"><span className={index}>{pad(i + 1)}</span><span className="truncate font-mono text-[0.8125rem]">{p.path}</span><span className="site-muted font-mono text-[0.8125rem] tabular-nums">{p.views.toLocaleString()}</span></li>)}</ol>
          </section>
          <section>
            <SectionLabel count={2}>To tidy</SectionLabel>
            <ul className="border-t border-[var(--line)] text-sm">{projects.filter((p) => p.health).map((p) => <li key={p.title} className="flex justify-between gap-3 border-b border-[var(--line)] py-3"><span>{p.title}</span><Link href={href("projects")} className="font-semibold text-[var(--accent)]">{p.health} →</Link></li>)}</ul>
          </section>
        </aside>
      </div>
      <section className="border-t border-[var(--line)] pt-12" style={paperMap}>
        <VisitorCountryMap countries={visitorCountries} />
      </section>
    </>
  );
}

function Notes() {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const list = notes.filter((n) => filter === "ALL" || n.status === filter);
  return (
    <>
      <PageHead kicker="Fig. 02 · Writing" title="Notes" lead="Technical notes and build logs. Weekly drafts from your notes land here for review."><Link href={href("write")} className={inkButton}>New note</Link></PageHead>
      <div role="tablist" aria-label="Filter notes" className="flex gap-6 overflow-x-auto border-b border-[var(--line)]">
        {(["ALL", "DRAFT", "SCHEDULED", "PUBLISHED"] as const).map((f) => <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`${label} -mb-px min-h-12 whitespace-nowrap border-b-2 ${filter === f ? "border-[var(--postcard-orange)]" : "site-muted border-transparent"}`}>{f === "ALL" ? "All" : f.toLowerCase()} <span className="text-[var(--accent)]">{pad(f === "ALL" ? notes.length : notes.filter((n) => n.status === f).length)}</span></button>)}
      </div>
      <ol>
        {list.map((n, i) => (
          <li key={n.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-[var(--line)] py-7 md:grid-cols-[3rem_minmax(0,1fr)_16rem]">
            <span className={`${index} pt-1.5`}>{pad(i + 1)}</span>
            <div>
              <Link href={href("write")} className={`text-[clamp(1.2rem,2vw,1.55rem)] hover:text-[var(--accent)] ${display} !leading-tight`}>{n.title}</Link>
              <p className="site-muted mt-2 max-w-[65ch] leading-[1.7]">{n.summary}</p>
            </div>
            <div className={`${label} col-start-2 flex items-center gap-3 md:col-start-auto md:flex-col md:items-end`}>
              {n.sent ? <Postmark date={n.sent} postdated={n.status === "SCHEDULED"} /> : <p className="site-muted">Draft{n.fromPipeline && " · from weekly notes"}</p>}
              <p className="site-muted">{n.category} · {n.minutes} min · {n.edited}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function Projects() {
  return (
    <>
      <PageHead kicker="Fig. 03 · Work" title="Projects" lead="Drag to set the order on the home page. Pinned projects lead."><button type="button" className={inkButton}>New project</button></PageHead>
      <ol>
        {projects.map((p, i) => (
          <li key={p.title} className="grid grid-cols-[1.5rem_2.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 border-b border-[var(--line)] py-7 md:grid-cols-[1.5rem_3rem_minmax(0,1.2fr)_minmax(0,1fr)_10rem]">
            <FaGripVertical aria-label={`Drag ${p.title}`} className="site-muted mt-1.5 cursor-grab" />
            <span className={`${index} pt-1`}>{pad(i + 1)}</span>
            <div><p className={`text-[clamp(1.2rem,2vw,1.55rem)] ${display} !leading-tight`}>{p.title}</p><p className={`${label} site-muted mt-2`}>{p.category}</p></div>
            <ul className="col-start-3 text-sm md:col-start-auto">{p.tech.map((t) => <li key={t} className="border-b border-dashed border-[var(--line)] py-1 last:border-0">{t}</li>)}</ul>
            <div className={`${label} col-start-3 space-y-1 md:col-start-auto md:text-right`}>
              <p className={statusColor[p.status]}>{p.status.toLowerCase()}</p>
              {p.pinned && <p><span className="rounded-full border border-[var(--accent)] px-2 py-0.5 text-[var(--accent)]">Pinned</span></p>}
              {p.health && <p className="text-[var(--accent)]">{p.health}</p>}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function Media() {
  return (
    <>
      <PageHead kicker="Fig. 04 · Library" title="Media" lead="Images used across notes and projects."><button type="button" className={lineButton}>Upload</button></PageHead>
      <ul className="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((m, i) => (
          <li key={m.name} className="overflow-hidden rounded-[1rem] border border-[var(--line)] bg-[var(--surface-raised)]">
            <div className="aspect-[4/3]" style={{ background: m.tint }} />
            <div className="p-3"><p className={`${index}`}>{pad(i + 1)}</p><p className="mt-1 truncate text-sm font-semibold">{m.name}</p><p className="site-muted font-mono text-[0.75rem]">{m.size}</p></div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Trash() {
  return (
    <>
      <PageHead kicker="Fig. 05 · Return to sender" title="Trash" lead="Deleted items stay here for 30 days." />
      <ol>{trash.map((t, i) => (
        <li key={t.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-4 border-b border-[var(--line)] py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto]">
          <span className={index}>{pad(i + 1)}</span>
          <div><p className="font-semibold">{t.title}</p><p className={`${label} site-muted mt-1`}>{t.type} · deleted {t.deleted} · purged {t.purge}</p></div>
          <button type="button" className={`${lineButton} col-start-2 justify-self-start sm:col-start-auto`}>Restore</button>
        </li>
      ))}</ol>
    </>
  );
}

function Settings() {
  const field = "mt-2 w-full border-0 border-b-[1.5px] border-[var(--foreground)] bg-transparent py-2 font-sans text-base normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--postcard-orange)]";
  return (
    <>
      <PageHead kicker="Fig. 06 · Account" title="Settings" />
      {[["Profile", [["Name", "Javier Raut"], ["Role line", "Software Engineer"], ["Location", "Cagayan de Oro, Philippines"]]], ["Weekly drafts", [["Schedule", "Sundays, 20:00"], ["Endpoint token", "•••• •••• 4f2a"]]]].map(([title, fields], i) => (
        <section key={title as string} className="grid gap-6 border-b border-[var(--line)] py-10 md:grid-cols-[16rem_minmax(0,1fr)]">
          <h2 className="flex gap-4"><span className={index}>{pad(i + 1)}</span><span className="font-semibold">{title as string}</span></h2>
          <div className="grid max-w-xl gap-6">{(fields as string[][]).map(([l, v]) => <label key={l} className={`${label} site-muted`}>{l}<input className={field} defaultValue={v} /></label>)}<button type="button" className={`${inkButton} justify-self-start`}>Save</button></div>
        </section>
      ))}
    </>
  );
}

function Write() {
  const [sending, setSending] = useState(useSearchParams().has("send"));
  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <header className="site-header sticky top-0 z-30">
        <div className="header-inner site-shell flex h-full items-center">
          <Link className="brand-lockup" href={href("notes")} aria-label="Back to notes"><strong aria-hidden="true">JR<span className="brand-dot">.</span></strong></Link>
          <p className={`${label} site-muted ml-5 mr-auto whitespace-nowrap`} aria-live="polite"><span className="max-sm:hidden">Draft · saved 14:20</span><span className="sm:hidden">Saved</span></p>
          <span className={`${label} site-muted mr-4 hidden sm:inline`}>412 words · 2 min</span>
          <button type="button" onClick={() => setSending(true)} className="primary-nav-link primary-nav-contact !ml-0 !mr-1.5"><span className="primary-nav-label"><span>Publish</span><span aria-hidden="true">Publish</span></span></button>
        </div>
      </header>

      {/* The note is written on a sheet of paper laid on the desk: the postcard's cream and 20 px grid, shadow only. */}
      <div className="px-2 pb-40 pt-8 sm:px-4 md:pt-14">
        <article className="mx-auto max-w-[50rem] bg-[var(--postcard-paper)] bg-[linear-gradient(var(--postcard-grid)_1px,transparent_1px),linear-gradient(90deg,var(--postcard-grid)_1px,transparent_1px)] bg-[size:20px_20px] px-[clamp(1.25rem,7vw,5rem)] pb-[clamp(3rem,8vw,6rem)] pt-[clamp(2.5rem,7vw,5rem)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)]">
          <p className={`${label} text-[var(--postcard-rust)]`}>Weekly · build log</p>
          <h1 contentEditable suppressContentEditableWarning className={`mt-4 text-[clamp(2.35rem,5vw,3.75rem)] outline-none ${display}`}>Week 46: the drafts endpoint, finally</h1>
          <p contentEditable suppressContentEditableWarning className="mt-5 text-[1.25rem] leading-[1.6] text-[var(--postcard-muted)] outline-none">How my Sunday notes now write the first draft for me.</p>
          <div className="mt-12 space-y-7 text-[1.125rem] leading-[1.75]">
            <p contentEditable suppressContentEditableWarning className="outline-none">{draftBody[0]}</p>
            <p className="relative">
              {/* Mock of the selection toolbar: appears over highlighted text. */}
              <span role="toolbar" aria-label="Format selection" className={`${label} absolute -top-14 left-10 z-10 flex items-center rounded-[8px] bg-[var(--postcard-ink)] p-1 text-[var(--postcard-paper)] shadow-[0_12px_30px_-12px_rgb(0_0_0/50%)]`}>{["B", "I", "Link", "H2", "H3", "Quote", "Code"].map((b) => <button key={b} type="button" className="min-h-9 rounded-[6px] px-2.5 hover:bg-[color-mix(in_srgb,var(--postcard-paper)_15%,transparent)]">{b}</button>)}</span>
              Nothing publishes on its own. The point is that <mark className="bg-[var(--accent-soft)] text-inherit">the hardest part, the blank page,</mark> is already gone when I open the admin on Monday.
            </p>
            <p contentEditable suppressContentEditableWarning className="outline-none">{draftBody[2]}</p>
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Insert image, code block or embed" className="-ml-14 grid size-10 shrink-0 place-items-center rounded-full border border-[var(--postcard-tear)] bg-[var(--postcard-paper)] text-[var(--postcard-muted)] hover:border-[var(--postcard-ink)] hover:text-[var(--postcard-ink)] max-md:ml-0"><FaPlus aria-hidden="true" /></button>
              <span className="text-[var(--postcard-muted)]">Keep writing, or type / for images and code</span>
            </div>
          </div>
        </article>
      </div>

      {sending && (
        // Medium-style publish step: how the note will look in lists on the left, where and when it goes on the right.
        <div role="dialog" aria-modal="true" aria-label="Publish note" className="fixed inset-0 z-40 overflow-y-auto bg-[var(--background)]">
          <div className="site-shell flex justify-end pt-6"><button type="button" onClick={() => setSending(false)} className={`${label} site-muted min-h-11 px-2 hover:text-[var(--foreground)]`}>Close ✕</button></div>
          <div className="mx-auto grid max-w-[64rem] gap-12 px-4 pb-24 pt-6 md:grid-cols-2 md:gap-16 md:pt-14">
            <section aria-labelledby="preview-heading">
              <h2 id="preview-heading" className={`${label}`}>Note preview</h2>
              <button type="button" className="mt-4 grid aspect-[16/9] w-full place-items-center rounded-[1rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] text-sm site-muted hover:border-[var(--foreground)]">Add a cover image</button>
              <input aria-label="Preview title" defaultValue="Week 46: the drafts endpoint, finally" className={`mt-6 w-full border-0 border-b border-[var(--line)] bg-transparent pb-2 text-[1.55rem] outline-none focus:border-[var(--postcard-orange)] ${display} !leading-tight`} />
              <textarea aria-label="Preview summary" rows={2} defaultValue={notes[0].summary} className="mt-3 w-full resize-none border-0 border-b border-[var(--line)] bg-transparent pb-2 leading-[1.7] site-muted outline-none focus:border-[var(--postcard-orange)]" />
              <p className="site-muted mt-3 text-sm">This changes how the note looks on the notes page and in link previews, not the note itself.</p>
            </section>
            <section aria-labelledby="publish-heading" className="grid content-start gap-7">
              <h2 id="publish-heading" className="text-[1.0625rem]">Publishing to <strong>Notes</strong></h2>
              <label className={`${label} site-muted`}>Category<input defaultValue="Weekly" className="mt-2 w-full border-0 border-b-[1.5px] border-[var(--foreground)] bg-transparent py-2 font-sans text-base normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--postcard-orange)]" /></label>
              <label className={`${label} site-muted`}>Link<span className="mt-2 flex items-baseline border-b-[1.5px] border-[var(--foreground)] font-sans text-base normal-case tracking-normal focus-within:border-[var(--postcard-orange)]"><span className="site-muted">/notes/</span><input defaultValue="week-46-drafts-endpoint" className="w-full bg-transparent py-2 text-[var(--foreground)] outline-none" /></span></label>
              <fieldset><legend className={`${label} site-muted`}>When</legend>
                <div className="mt-3 flex gap-2">{["Now", "Schedule"].map((o, i) => <label key={o} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] border border-[var(--line)] px-4 text-sm has-[:checked]:border-[var(--foreground)] has-[:checked]:font-semibold"><input type="radio" name="when" defaultChecked={i === 0} className="accent-[var(--postcard-orange)]" />{o}</label>)}</div>
              </fieldset>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-[var(--postcard-orange)]" />Pin to the top of the notes page</label>
              <div className="flex flex-wrap gap-2 pt-2"><button type="button" className={inkButton}>Publish now</button><button type="button" onClick={() => setSending(false)} className={lineButton}>Back to writing</button></div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
