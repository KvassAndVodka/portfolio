"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaArrowUpRightFromSquare, FaImage, FaXmark } from "react-icons/fa6";
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

const fieldLabel = "block font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] site-muted";
const lineBox = "mt-2 border-b-[1.5px] border-[var(--foreground)] focus-within:border-[var(--postcard-orange)] has-[[aria-invalid=true]]:border-[var(--accent)]";
const line = `${lineBox} block w-full bg-transparent py-2 text-base outline-none placeholder:text-[var(--muted)] aria-[invalid=true]:border-[var(--accent)]`;
const help = "site-muted mt-2 text-xs leading-[1.6]";

// Our own words for the browser's validation errors, shown under the field instead of the native bubble.
function messageFor(field: HTMLInputElement | HTMLTextAreaElement) {
  const { validity, name } = field;
  if (validity.valueMissing) return ({ title: "Give it a title.", summary: "Add a one-line summary.", scheduledFor: "Pick the date and time to publish." } as Record<string, string>)[name] ?? "Fill in this field.";
  if (validity.typeMismatch) return "Enter a full link that starts with https://.";
  if (validity.patternMismatch) return "Use lowercase letters, numbers and hyphens only.";
  return field.validationMessage;
}

function FieldError({ name, message }: Readonly<{ name: string; message?: string }>) {
  if (!message) return null;
  return <p id={`${name}-error`} role="alert" className="mt-2 font-mono text-xs font-semibold text-[var(--accent)]">{message}</p>;
}

/** One numbered row of the details sheet: index and title on the left, fields on the right. */
function DetailRow({ index, title, lead, last, children }: Readonly<{ index: number; title: string; lead: string; last?: boolean; children: React.ReactNode }>) {
  return (
    <section data-reveal aria-label={title} className={`grid gap-6 border-t border-[var(--line)] pt-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10 ${last ? "" : "pb-10"}`}>
      <div>
        <span className="font-mono text-[0.75rem] font-semibold tabular-nums text-[var(--accent)]">{String(index).padStart(2, "0")}</span>
        <h3 className="mt-2 text-[1.125rem] font-[620] tracking-[-0.01em]">{title}<span className="text-[var(--postcard-orange)]">.</span></h3>
        <p className="site-muted mt-1 text-sm leading-[1.6]">{lead}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function PostForm({ initialData, action, submitLabel }: PostFormProps) {
  const [type, setType] = useState<ContentType>(initialData?.type || "BLOG");
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || "DRAFT");
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [words, setWords] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const focusedError = useRef(false);
  const invalid = (name: string) => ({ "aria-invalid": errors[name] ? true : undefined, "aria-errormessage": errors[name] ? `${name}-error` : undefined });
  const isEditing = Boolean(initialData?.id);
  const publicPath = type === "PROJECT" ? `/projects/${initialData?.slug}` : `/notes/${initialData?.slug}`;
  const listPath = type === "PROJECT" ? "/admin/projects" : "/admin/notes";
  const sheetLabel = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";

  return (
    <form
      action={action}
      className="post-form pb-24"
      // Replace the browser's validation bubble with a message under each field, and bring the first problem into view.
      onInvalidCapture={(event) => {
        event.preventDefault();
        const field = event.target as HTMLInputElement | HTMLTextAreaElement;
        setErrors((current) => ({ ...current, [field.name]: messageFor(field) }));
        if (!focusedError.current) {
          focusedError.current = true;
          field.focus({ preventScroll: true });
          field.scrollIntoView({ block: "center", behavior: "smooth" });
          requestAnimationFrame(() => { focusedError.current = false; });
        }
      }}
      onInputCapture={(event) => {
        const field = event.target as HTMLInputElement;
        if (errors[field.name] && field.validity?.valid) setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== field.name)));
      }}
    >
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
        <textarea id="post-title" {...invalid("title")} name="title" rows={1} defaultValue={initialData?.title} maxLength={140} required placeholder={type === "PROJECT" ? "Project name" : "Title"} className="mt-3 w-full resize-none bg-transparent pb-[0.14em] pt-[0.06em] text-[clamp(2.35rem,5vw,3.75rem)] font-[620] leading-[1.06] tracking-[-0.035em] outline-none placeholder:text-[var(--postcard-tear)]" style={{ fieldSizing: "content" } as React.CSSProperties} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} />
        <FieldError name="title" message={errors.title} />
        <label htmlFor="post-summary" className="sr-only">Summary</label>
        <textarea id="post-summary" {...invalid("summary")} name="summary" rows={1} defaultValue={initialData?.summary} maxLength={320} required placeholder="A one-line summary, shown in lists and link previews" className="mt-5 w-full resize-none bg-transparent text-[1.25rem] leading-[1.6] text-[var(--postcard-muted)] outline-none placeholder:text-[var(--postcard-tear)]" style={{ fieldSizing: "content" } as React.CSSProperties} />
        <FieldError name="summary" message={errors.summary} />
        <div className="mt-12">
          <PaperEditor name="content" defaultValue={initialData?.content} onWords={setWords} placeholder={type === "PROJECT" ? "Tell the story: the problem, what you built, what changed…" : "Start writing…"} />
        </div>
      </article>

      {/* Details, filed like a spec sheet: numbered rows on hairlines, mono labels, underlined fields. */}
      <section aria-labelledby="details-heading" className="mx-auto mt-20 max-w-[50rem]">
        <h2 id="details-heading" className={`${sheetLabel} text-[var(--accent)]`}>Details</h2>
        <p className="site-muted mt-3 max-w-[32rem] leading-[1.7]">How this {type === "PROJECT" ? "project" : "note"} is filed, linked and published. The sheet above is all readers see.</p>

        <DetailRow index={1} title="Address" lead="Where it lives on the site.">
          <div className="grid gap-7 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="post-slug" className={fieldLabel}>Link</label>
              <span className={`${lineBox} flex items-baseline`}>
                <span className="site-muted shrink-0">/{type === "PROJECT" ? "projects" : "notes"}/</span>
                <input id="post-slug" {...invalid("slug")} className="w-full min-w-0 bg-transparent py-2 font-mono text-[0.95rem] outline-none" name="slug" defaultValue={initialData?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="generated-from-title" aria-describedby="slug-help" />
              </span>
              <FieldError name="slug" message={errors.slug} />
              <p id="slug-help" className={help}>Lowercase letters, numbers and hyphens. Leave empty to generate it from the title.</p>
            </div>
            <div>
              <label htmlFor="post-category" className={fieldLabel}>Category</label>
              <input id="post-category" className={line} name="category" defaultValue={initialData?.category || ""} placeholder={type === "PROJECT" ? "Professional, personal…" : "Tutorial, field note…"} />
            </div>
          </div>
        </DetailRow>

        {type === "PROJECT" && (
          <DetailRow index={2} title="Project" lead="The evidence on the homepage card and the project page.">
            <div className="grid gap-7 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="post-outcome" className={fieldLabel}>What changed</label>
                <textarea id="post-outcome" className={`${line} resize-none`} style={{ fieldSizing: "content" } as React.CSSProperties} name="outcome" rows={1} maxLength={200} defaultValue={initialData?.outcome || ""} placeholder="One searchable record replaced scattered spreadsheets." aria-describedby="outcome-help" />
                <p id="outcome-help" className={help}>The highlight on the homepage card. Leave empty to hide it.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="post-tech" className={fieldLabel}>Built with</label>
                <input id="post-tech" className={line} name="techStack" defaultValue={initialData?.techStack?.join(", ")} placeholder="Next.js, PostgreSQL, Docker" aria-describedby="tech-help" />
                <p id="tech-help" className={help}>Separate technologies with commas.</p>
              </div>
              <div><label htmlFor="github-url" className={fieldLabel}>Source</label><input id="github-url" {...invalid("githubUrl")} className={line} name="githubUrl" type="url" defaultValue={initialData?.githubUrl || ""} placeholder="https://github.com/…" /><FieldError name="githubUrl" message={errors.githubUrl} /></div>
              <div><label htmlFor="demo-url" className={fieldLabel}>Live demo</label><input id="demo-url" {...invalid("demoUrl")} className={line} name="demoUrl" type="url" defaultValue={initialData?.demoUrl || ""} placeholder="https://…" /><FieldError name="demoUrl" message={errors.demoUrl} /></div>
              <div className="sm:col-span-2"><label htmlFor="project-url" className={fieldLabel}>Other link</label><input id="project-url" {...invalid("projectUrl")} className={line} name="projectUrl" type="url" defaultValue={initialData?.projectUrl || ""} placeholder="https://…" /><FieldError name="projectUrl" message={errors.projectUrl} /></div>
            </div>
          </DetailRow>
        )}

        <DetailRow index={type === "PROJECT" ? 3 : 2} title="Publishing" lead="Who can see it, and from when.">
          <fieldset>
            <legend className={fieldLabel}>Status</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex min-h-11 cursor-pointer flex-col justify-center rounded-[8px] border border-[var(--line)] px-4 py-3 transition-colors hover:border-[var(--foreground)] has-[:checked]:border-[var(--foreground)] has-[:checked]:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]">
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="status" value={option.value} checked={status === option.value} onChange={() => setStatus(option.value)} className="size-4 accent-[var(--postcard-orange)]" />
                    {option.label}
                  </span>
                  <span className="site-muted mt-1 pl-6 text-sm">{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {status === "SCHEDULED" && (
            <div className="mt-7 max-w-xs">
              <label htmlFor="scheduled-for" className={fieldLabel}>Publish on</label>
              <input id="scheduled-for" {...invalid("scheduledFor")} className={line} name="scheduledFor" type="datetime-local" defaultValue={toLocalDateTime(initialData?.publishedAt)} required />
              <FieldError name="scheduledFor" message={errors.scheduledFor} />
            </div>
          )}
          {type === "PROJECT" && (
            <ul className="mt-7 border-t border-[var(--line)]">
              <li className="border-b border-[var(--line)]"><label className="flex min-h-14 cursor-pointer items-center gap-4 py-3"><input className="size-4 shrink-0 accent-[var(--postcard-orange)]" name="isPinned" type="checkbox" defaultChecked={initialData?.isPinned} /><span><span className="block font-semibold">Feature on the homepage</span><span className="site-muted text-sm">Adds it to the project gallery.</span></span></label></li>
              <li className="border-b border-[var(--line)]"><label className="flex min-h-14 cursor-pointer items-center gap-4 py-3"><input className="size-4 shrink-0 accent-[var(--postcard-orange)]" name="showAsBlog" type="checkbox" defaultChecked={initialData?.showAsBlog} /><span><span className="block font-semibold">List it under Notes too</span><span className="site-muted text-sm">The case study also appears in the notes index.</span></span></label></li>
            </ul>
          )}
        </DetailRow>

        <DetailRow index={type === "PROJECT" ? 4 : 3} title="Cover" lead="Shown in lists and link previews." last>
          <div className="relative">
            <button type="button" onClick={() => setShowThumbnailPicker(true)} className="group relative grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-[1rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] text-sm hover:border-[var(--foreground)]" aria-label={thumbnail ? "Change cover image" : "Add a cover image"}>
              {thumbnail ? <Image src={thumbnail} alt="Current cover image" fill sizes="(min-width: 768px) 36rem, 100vw" unoptimized className="object-cover" /> : <span className="site-muted flex flex-col items-center gap-2 group-hover:text-[var(--foreground)]"><FaImage className="text-xl" aria-hidden="true" />Add a cover image</span>}
            </button>
            {thumbnail && <button type="button" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-[var(--background)] shadow-[var(--postcard-shadow)]" onClick={() => setThumbnail("")} aria-label="Remove cover image"><FaXmark aria-hidden="true" /></button>}
          </div>
        </DetailRow>
      </section>

      {showThumbnailPicker && <MediaPicker onSelect={(url) => { setThumbnail(url); setShowThumbnailPicker(false); }} onClose={() => setShowThumbnailPicker(false)} />}
    </form>
  );
}
