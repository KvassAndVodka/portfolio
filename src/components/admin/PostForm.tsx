"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaArrowUpRightFromSquare, FaCheck, FaChevronDown, FaImage, FaXmark } from "react-icons/fa6";
import MarkdownEditor from "@/components/MarkdownEditor";
import MediaPicker from "./MediaPicker";

type ContentType = "BLOG" | "PROJECT";
type ContentStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

const statusOptions: Array<{ value: ContentStatus; label: string; description: string }> = [
  { value: "DRAFT", label: "Draft", description: "Only visible in admin" },
  { value: "PUBLISHED", label: "Published", description: "Visible on the portfolio" },
  { value: "SCHEDULED", label: "Scheduled", description: "Publishes at a chosen time" },
];

interface PostFormProps {
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
  };
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

function toLocalDateTime(value?: Date | string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function StatusSelect({ value, onChange }: { value: ContentStatus; onChange: (status: ContentStatus) => void }) {
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
  const isEditing = Boolean(initialData?.id);
  const publicPath = type === "PROJECT" ? `/projects/${initialData?.slug}` : `/notes/${initialData?.slug}`;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="thumbnail" value={thumbnail} />

      <div className="flex flex-col gap-4 border-b border-[var(--admin-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium">Content type</p>
          {isEditing ? (
            <p className="mt-1 text-sm admin-muted">{type === "PROJECT" ? "Project" : "Note"}</p>
          ) : (
            <div className="mt-2 inline-flex rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1" role="group" aria-label="Content type">
              <button type="button" onClick={() => setType("BLOG")} aria-pressed={type === "BLOG"} className={`min-h-9 rounded-md px-4 text-sm font-medium ${type === "BLOG" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted"}`}>Note</button>
              <button type="button" onClick={() => setType("PROJECT")} aria-pressed={type === "PROJECT"} className={`min-h-9 rounded-md px-4 text-sm font-medium ${type === "PROJECT" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted"}`}>Project</button>
            </div>
          )}
        </div>
        {isEditing && initialData?.slug && <a href={publicPath} target="_blank" className="admin-button-secondary"><FaArrowUpRightFromSquare aria-hidden="true" />Preview public page</a>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="admin-panel p-5 md:p-6" aria-labelledby="content-basics-heading">
            <h2 id="content-basics-heading" className="admin-section-title">Basics</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="post-title" className="mb-2 block text-sm font-medium">Title</label>
                <input id="post-title" className="admin-field" name="title" defaultValue={initialData?.title} maxLength={140} required placeholder={type === "PROJECT" ? "Project name" : "Note title"} />
              </div>
              <div>
                <label htmlFor="post-slug" className="mb-2 block text-sm font-medium">URL slug</label>
                <input id="post-slug" className="admin-field font-mono text-sm" name="slug" defaultValue={initialData?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="generated-from-title" aria-describedby="slug-help" />
                <p id="slug-help" className="mt-1.5 text-xs admin-muted">Lowercase letters, numbers and hyphens. Leave empty to generate.</p>
              </div>
              <div>
                <label htmlFor="post-category" className="mb-2 block text-sm font-medium">Category</label>
                <input id="post-category" className="admin-field" name="category" defaultValue={initialData?.category || ""} placeholder={type === "PROJECT" ? "Professional, personal…" : "Tutorial, field note…"} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="post-summary" className="mb-2 block text-sm font-medium">Summary</label>
                <textarea id="post-summary" className="admin-textarea" name="summary" defaultValue={initialData?.summary} maxLength={320} required placeholder="A concise description shown in listings and previews." />
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
                <div className="md:col-span-2"><label htmlFor="project-url" className="mb-2 block text-sm font-medium">Additional project link</label><input id="project-url" className="admin-field" name="projectUrl" type="url" defaultValue={initialData?.projectUrl || ""} placeholder="https://…" /></div>
              </div>
            </section>
          )}

          <section className="admin-panel overflow-hidden" aria-labelledby="content-body-heading">
            <div className="border-b border-[var(--admin-border)] px-5 py-4 md:px-6"><h2 id="content-body-heading" className="admin-section-title">{type === "PROJECT" ? "Case study" : "Note"}</h2><p className="mt-1 text-sm admin-muted">Markdown is supported.</p></div>
            <MarkdownEditor name="content" defaultValue={initialData?.content} />
          </section>
        </div>

        <aside className="space-y-5">
          <section className="admin-panel p-5" aria-labelledby="publishing-heading">
            <h2 id="publishing-heading" className="admin-section-title">Publishing</h2>
            <label htmlFor="post-status" className="mt-4 mb-2 block text-sm font-medium">Status</label>
            <StatusSelect value={status} onChange={setStatus} />
            {status === "SCHEDULED" && <div className="mt-4"><label htmlFor="scheduled-for" className="mb-2 block text-sm font-medium">Publish date</label><input id="scheduled-for" className="admin-field" name="scheduledFor" type="datetime-local" defaultValue={toLocalDateTime(initialData?.publishedAt)} required /></div>}
            <div className="mt-5 space-y-3 border-t border-[var(--admin-border)] pt-4">
              {type === "PROJECT" && <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4 accent-[var(--accent)]" name="isPinned" type="checkbox" defaultChecked={initialData?.isPinned} /><span><strong className="block font-medium">Feature on homepage</strong><span className="admin-muted">Add this project to the homepage bento.</span></span></label>}
              {type === "PROJECT" && <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4 accent-[var(--accent)]" name="showAsBlog" type="checkbox" defaultChecked={initialData?.showAsBlog} /><span><strong className="block font-medium">Publish as a Note too</strong><span className="admin-muted">Include the case study in the Notes index.</span></span></label>}
            </div>
            <button type="submit" className="admin-button-primary mt-5 w-full">{submitLabel}</button>
          </section>

          <section className="admin-panel p-5" aria-labelledby="thumbnail-heading">
            <div className="flex items-center justify-between"><h2 id="thumbnail-heading" className="admin-section-title">Thumbnail</h2>{thumbnail && <button type="button" className="admin-icon-button" onClick={() => setThumbnail("")} aria-label="Remove thumbnail"><FaXmark aria-hidden="true" /></button>}</div>
            <button type="button" onClick={() => setShowThumbnailPicker(true)} className="relative mt-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-subtle)] hover:border-[var(--accent)]" aria-label={thumbnail ? "Change thumbnail" : "Choose thumbnail"}>
              {thumbnail ? <Image src={thumbnail} alt="Current thumbnail preview" fill sizes="20rem" unoptimized className="object-cover" /> : <span className="flex flex-col items-center gap-2 text-sm admin-muted"><FaImage className="text-xl" aria-hidden="true" />Choose image</span>}
            </button>
          </section>
        </aside>
      </div>

      {showThumbnailPicker && <MediaPicker onSelect={(url) => { setThumbnail(url); setShowThumbnailPicker(false); }} onClose={() => setShowThumbnailPicker(false)} />}
    </form>
  );
}
