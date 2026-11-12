"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowUpRightFromSquare, FaMagnifyingGlass } from "react-icons/fa6";
import DeleteButton from "@/components/admin/DeleteButton";

interface NoteItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string | null;
  type: "BLOG" | "PROJECT";
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  updatedAt: Date | string;
}

type NotesManagerProps = Readonly<{
  notes: NoteItem[];
  initialStatus?: string;
}>;

const statuses = ["ALL", "DRAFT", "SCHEDULED", "PUBLISHED"] as const;
const pad = (n: number) => String(n).padStart(2, "0");

export default function NotesManager({ notes, initialStatus }: NotesManagerProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus || "ALL");
  const filtered = useMemo(() => notes.filter((note) => {
    const haystack = `${note.title} ${note.summary} ${note.category || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "ALL" || note.status === status);
  }), [notes, query, status]);

  return (
    <>
      <div className="flex flex-col-reverse gap-4 border-b border-[var(--line)] md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter notes by status" className="-mb-px flex gap-6 overflow-x-auto">
          {statuses.map((value) => (
            <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)} className={`admin-label min-h-12 whitespace-nowrap border-b-2 ${status === value ? "border-[var(--postcard-orange)]" : "site-muted border-transparent hover:text-[var(--foreground)]"}`}>
              {value === "ALL" ? "All" : value.toLowerCase()} <span className="text-[var(--accent)]">{pad(value === "ALL" ? notes.length : notes.filter((note) => note.status === value).length)}</span>
            </button>
          ))}
        </div>
        <label className="relative mt-6 md:mb-2 md:mt-0">
          <span className="sr-only">Search notes</span>
          <FaMagnifyingGlass className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input className="admin-field !pl-9 md:w-72" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search notes" />
        </label>
      </div>

      {filtered.length > 0 ? (
        <ol aria-label="Notes">
          {filtered.map((note, index) => {
            const words = note.content.trim().split(/\s+/).filter(Boolean).length;
            const editPath = note.type === "PROJECT" ? `/admin/projects/${note.slug}` : `/admin/notes/${note.slug}`;
            return (
              <li key={note.id} data-reveal className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-[var(--line)] py-7 md:grid-cols-[3rem_minmax(0,1fr)_auto]">
                <span className="admin-index pt-1.5">{pad(index + 1)}</span>
                <div className="min-w-0">
                  <Link href={editPath} className="text-[clamp(1.2rem,2vw,1.55rem)] font-[620] leading-tight tracking-[-0.03em] hover:text-[var(--accent)]">{note.title}</Link>
                  {note.summary && <p className="site-muted mt-2 line-clamp-2 max-w-[65ch] leading-[1.7]">{note.summary}</p>}
                  <p className="admin-label site-muted mt-3 flex flex-wrap gap-x-3 gap-y-1">
                    <span className={`admin-status admin-status-${note.status.toLowerCase()}`}>{note.status.toLowerCase()}</span>
                    {note.type === "PROJECT" && <span className="text-[var(--accent)]">From project</span>}
                    <span>{note.category || "Uncategorized"}</span>
                    <span>{Math.max(1, Math.ceil(words / 200))} min</span>
                    <span>edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                  </p>
                </div>
                <div className="col-start-2 flex items-center gap-1 md:col-start-auto md:self-start">
                  <Link href={editPath} className="admin-button-secondary">Edit</Link>
                  <a href={`/notes/${note.slug}`} target="_blank" className="admin-icon-button" aria-label={`Preview ${note.title} (opens in a new tab)`}><FaArrowUpRightFromSquare aria-hidden="true" /></a>
                  {note.type === "BLOG" && <DeleteButton id={note.id} />}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="py-14">
          <p className="font-semibold">No notes to show</p>
          <p className="site-muted mt-1">{notes.length ? "Try another search or status." : "Start a draft when you have something worth sharing."}</p>
        </div>
      )}
    </>
  );
}
