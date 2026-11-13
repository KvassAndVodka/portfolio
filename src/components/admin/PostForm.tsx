"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaArrowUpRightFromSquare, FaCheck, FaChevronDown, FaImage, FaXmark } from "react-icons/fa6";
import MediaPicker from "./MediaPicker";
import PaperEditor from "./PaperEditor";

type ContentType = "BLOG" | "PROJECT";
type ContentStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

const statusOptions: Array<{ value: ContentStatus; label: string; description: string }> = [
  { value: "DRAFT", label: "Draft", description: "Only visible in admin" },
  { value: "PUBLISHED", label: "Published", description: "Visible on the portfolio" },
  { value: "SCHEDULED", label: "Scheduled", description: "Publishes at a chosen time" },
];

type PostFormProps = Readonly<{
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    type: ContentType;
    status?: ContentStatus;
    publishedAt?: Date | string;
    category?: string | null;
    techStack?: string[];
    githubUrl?: string | null;
    demoUrl?: string | null;
    projectUrl?: string | null;
    isPinned: boolean;
    showAsBlog: boolean;
    thumbnail?: string | null;
    outcome?: string | null;
  };
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}>;

function toLocalDateTime(value?: Date | string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

type StatusSelectProps = Readonly<{
  value: ContentStatus,
  onChange: (status: ContentStatus) => void
}>;

function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = statusOptions.find((option) => option.value === value) ?? statusOptions[0];

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="status" value={value} />
      <button
        id="post-status"
        type="button"
        className="admin-field flex items-center justify-between gap-3 text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span><span className="block font-medium">{selected.label}</span><span className="block text-xs admin-muted">{selected.description}</span></span>
        <FaChevronDown className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="admin-surface absolute inset-x-0 top-[calc(100%+0.4rem)] z-20 overflow-hidden rounded-lg border border-[var(--admin-border)] py-1" role="listbox" aria-label="Publication status">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--admin-surface-subtle)] ${option.value === value ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : ""}`}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
            >
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{option.label}</span><span className={`block text-xs ${option.value === value ? "opacity-80" : "admin-muted"}`}>{option.description}</span></span>
              {option.value === value && <FaCheck aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostForm({ initialData, action, submitLabel }: PostFormProps) {
  const [type, setType] = useState<ContentType>(initialData?.type || "BLOG");
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || "DRAFT");
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [words, setWords] = useState(0);
  const isEditing = Boolean(initialData?.id);
  const publicPath = type === "PROJECT" ? `/projects/${initialData?.slug}` : `/notes/${initialData?.slug}`;
  const listPath = type === "PROJECT" ? "/admin/projects" : "/admin/notes";
  const sheetLabel = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";

  return (
    <form action={action} className="pb-24">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="thumbnail" value={thumbnail} />

      {/* A slim bar that stays while writing: way back, length, and save. */}
      <div className="sticky top-0 z-20 -mx-4 flex min-h-14 items-center gap-3 border-b border-[var(--line)] bg-[var(--background)] px-4 sm:mx-0 sm:px-0">
        <Link href={listPath} className="admin-icon-button" aria-label={`All ${type === "PROJECT" ? "projects" : "notes"}`}><FaArrowLeft aria-hidden="true" /></Link>
        {isEditing ? (
          <p className={`${sheetLabel} site-muted`}>{type === "PROJECT" ? "Project" : "Note"} · {statusOptions.find((o) => o.value === status)?.label}</p>
        ) : (
          <div className="inline-flex rounded-lg border border-[var(--line)] p-1" role="group" aria-label="Content type">
            <button type="button" onClick={() => setType("BLOG")} aria-pressed={type === "BLOG"} className={`min-h-9 rounded-md px-3 text-sm font-medium ${type === "BLOG" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted"}`}>Note</button>
            <button type="button" onClick={() => setType("PROJECT")} aria-pressed={type === "PROJECT"} className={`min-h-9 rounded-md px-3 text-sm font-medium ${type === "PROJECT" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted"}`}>Project</button>
          </div>
        )}
        <p className={`${sheetLabel} site-muted ml-auto hidden sm:block`} aria-live="polite">{words} words · {Math.max(1, Math.round(words / 230))} min</p>
        {isEditing && initialData?.slug && <a href={publicPath} target="_blank" className="admin-icon-button max-sm:ml-auto" aria-label="Preview public page"><FaArrowUpRightFromSquare aria-hidden="true" /></a>}
        <button type="submit" className="admin-button-primary">{submitLabel}</button>
      </div>

      {/* The post is written on a sheet of paper laid on the desk: the postcard's cream and 20 px grid, shadow only. */}
      <article className="mx-auto mt-8 max-w-[50rem] bg-[var(--postcard-paper)] bg-[linear-gradient(var(--postcard-grid)_1px,transparent_1px),linear-gradient(90deg,var(--postcard-grid)_1px,transparent_1px)] bg-[size:20px_20px] px-[clamp(1.25rem,7vw,5rem)] pb-[clamp(3rem,8vw,6rem)] pt-[clamp(2.5rem,7vw,5rem)] text-[var(--postcard-ink)] shadow-[var(--postcard-shadow)] md:mt-14">
        <p className={`${sheetLabel} text-[var(--postcard-rust)]`}>{type === "PROJECT" ? "Case study" : "Note"}</p>
        <label htmlFor="post-title" className="sr-only">Title</label>
        <textarea id="post-title" name="title" rows={1} defaultValue={initialData?.title} maxLength={140} required placeholder={type === "PROJECT" ? "Project name" : "Title"} className="mt-3 w-full resize-none bg-transparent pb-[0.14em] pt-[0.06em] focus-visible:outline-none text-[clamp(2.35rem,5vw,3.75rem)] font-[620] leading-[1.06] tracking-[-0.035em] outline-none placeholder:text-[var(--postcard-tear)]" style={{ fieldSizing: "content" } as React.CSSProperties} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} />
        <label htmlFor="post-summary" className="sr-only">Summary</label>
        <textarea id="post-summary" name="summary" rows={1} defaultValue={initialData?.summary} maxLength={320} required placeholder="A one-line summary, shown in lists and link previews" className="mt-5 w-full resize-none bg-transparent focus-visible:outline-none text-[1.25rem] leading-[1.6] text-[var(--postcard-muted)] outline-none placeholder:text-[var(--postcard-tear)]" style={{ fieldSizing: "content" } as React.CSSProperties} />
        <div className="mt-12">
          <PaperEditor name="content" defaultValue={initialData?.content} onWords={setWords} placeholder={type === "PROJECT" ? "Tell the story: the problem, what you built, what changed…" : "Start writing…"} />
        </div>
      </article>

      <h2 className={`${sheetLabel} mx-auto mt-16 max-w-[50rem] text-[var(--accent)]`}>Details</h2>
      <div className="mx-auto mt-6 grid max-w-[50rem] gap-6">
          <section className="admin-panel p-5 md:p-6" aria-labelledby="content-basics-heading">
            <h2 id="content-basics-heading" className="admin-section-title">Address</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="post-slug" className="mb-2 block text-sm font-medium">URL slug</label>
                <input id="post-slug" className="admin-field font-mono text-sm" name="slug" defaultValue={initialData?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="generated-from-title" aria-describedby="slug-help" />
                <p id="slug-help" className="mt-1.5 text-xs admin-muted">Lowercase letters, numbers and hyphens. Leave empty to generate.</p>
              </div>
              <div>
                <label htmlFor="post-category" className="mb-2 block text-sm font-medium">Category</label>
                <input id="post-category" className="admin-field" name="category" defaultValue={initialData?.category || ""} placeholder={type === "PROJECT" ? "Professional, personal…" : "Tutorial, field note…"} />
              </div>
            </div>
          </section>

          {type === "PROJECT" && (
            <section className="admin-panel p-5 md:p-6" aria-labelledby="project-details-heading">
              <h2 id="project-details-heading" className="admin-section-title">Project details</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><label htmlFor="post-tech" className="mb-2 block text-sm font-medium">Technologies</label><input id="post-tech" className="admin-field" name="techStack" defaultValue={initialData?.techStack?.join(", ")} placeholder="Next.js, PostgreSQL, Docker" aria-describedby="tech-help" /><p id="tech-help" className="mt-1.5 text-xs admin-muted">Separate technologies with commas.</p></div>
                <div><label htmlFor="github-url" className="mb-2 block text-sm font-medium">GitHub repository</label><input id="github-url" className="admin-field" name="githubUrl" type="url" defaultValue={initialData?.githubUrl || ""} placeholder="https://github.com/…" /></div>
                <div><label htmlFor="demo-url" className="mb-2 block text-sm font-medium">Live demo</label><input id="demo-url" className="admin-field" name="demoUrl" type="url" defaultValue={initialData?.demoUrl || ""} placeholder="https://…" /></div>
                <div className="md:col-span-2"><label htmlFor="post-outcome" className="mb-2 block text-sm font-medium">What changed</label><textarea id="post-outcome" className="admin-textarea" name="outcome" rows={2} maxLength={200} defaultValue={initialData?.outcome || ""} placeholder="One line on the result, e.g. One searchable record replaced scattered spreadsheets." aria-describedby="outcome-help" /><p id="outcome-help" className="mt-1.5 text-xs admin-muted">Shown as the highlight on the homepage project card. Leave empty to hide it.</p></div>
                <div className="md:col-span-2"><label htmlFor="project-url" className="mb-2 block text-sm font-medium">Additional project link</label><input id="project-url" className="admin-field" name="projectUrl" type="url" defaultValue={initialData?.projectUrl || ""} placeholder="https://…" /></div>
              </div>
            </section>
          )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="admin-panel p-5" aria-labelledby="publishing-heading">
            <h2 id="publishing-heading" className="admin-section-title">Publishing</h2>
            <label htmlFor="post-status" className="mt-4 mb-2 block text-sm font-medium">Status</label>
            <StatusSelect value={status} onChange={setStatus} />
            {status === "SCHEDULED" && <div className="mt-4"><label htmlFor="scheduled-for" className="mb-2 block text-sm font-medium">Publish date</label><input id="scheduled-for" className="admin-field" name="scheduledFor" type="datetime-local" defaultValue={toLocalDateTime(initialData?.publishedAt)} required /></div>}
            <div className="mt-5 space-y-3 border-t border-[var(--admin-border)] pt-4">
              {type === "PROJECT" && <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4 accent-[var(--accent)]" name="isPinned" type="checkbox" defaultChecked={initialData?.isPinned} /><span><strong className="block font-medium">Feature on homepage</strong><span className="admin-muted">Add this project to the homepage bento.</span></span></label>}
              {type === "PROJECT" && <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4 accent-[var(--accent)]" name="showAsBlog" type="checkbox" defaultChecked={initialData?.showAsBlog} /><span><strong className="block font-medium">Publish as a Note too</strong><span className="admin-muted">Include the case study in the Notes index.</span></span></label>}
            </div>
          </section>

          <section className="admin-panel p-5" aria-labelledby="thumbnail-heading">
            <div className="flex items-center justify-between"><h2 id="thumbnail-heading" className="admin-section-title">Thumbnail</h2>{thumbnail && <button type="button" className="admin-icon-button" onClick={() => setThumbnail("")} aria-label="Remove thumbnail"><FaXmark aria-hidden="true" /></button>}</div>
            <button type="button" onClick={() => setShowThumbnailPicker(true)} className="relative mt-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-subtle)] hover:border-[var(--accent)]" aria-label={thumbnail ? "Change thumbnail" : "Choose thumbnail"}>
              {thumbnail ? <Image src={thumbnail} alt="Current thumbnail preview" fill sizes="20rem" unoptimized className="object-cover" /> : <span className="flex flex-col items-center gap-2 text-sm admin-muted"><FaImage className="text-xl" aria-hidden="true" />Choose image</span>}
            </button>
          </section>
        </div>
      </div>

      {showThumbnailPicker && <MediaPicker onSelect={(url) => { setThumbnail(url); setShowThumbnailPicker(false); }} onClose={() => setShowThumbnailPicker(false)} />}
    </form>
  );
}
