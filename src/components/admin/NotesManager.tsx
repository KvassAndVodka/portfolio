"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowUpRightFromSquare, FaMagnifyingGlass, FaPencil } from "react-icons/fa6";
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

export default function NotesManager({ notes, initialStatus }: { notes: NoteItem[]; initialStatus?: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus || "ALL");
  const filtered = useMemo(() => notes.filter((note) => {
    const haystack = `${note.title} ${note.summary} ${note.category || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "ALL" || note.status === status);
  }), [notes, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <label className="relative"><span className="sr-only">Search notes</span><FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 admin-muted" aria-hidden="true" /><input className="admin-field min-w-64 !pl-9" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search notes" /></label>
        <label><span className="sr-only">Filter notes by status</span><select className="admin-select" value={status} onChange={(event) => setStatus(event.currentTarget.value)}><option value="ALL">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Drafts</option><option value="SCHEDULED">Scheduled</option></select></label>
      </div>
      <section className="admin-panel overflow-hidden" aria-label="Notes">
        {filtered.length > 0 ? <ul className="divide-y divide-[var(--admin-border)]">{filtered.map((note) => {
          const words = note.content.trim().split(/\s+/).filter(Boolean).length;
          const editPath = note.type === "PROJECT" ? `/admin/projects/${note.slug}` : `/admin/notes/${note.slug}`;
          return <li key={note.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center md:px-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={editPath} className="truncate font-semibold hover:text-[var(--accent-hover)]">{note.title}</Link><span className={`admin-status admin-status-${note.status.toLowerCase()}`}>{note.status.toLowerCase()}</span>{note.type === "PROJECT" && <span className="admin-status bg-[var(--accent-soft)] text-[var(--accent-hover)]">From project</span>}</div><p className="mt-1 line-clamp-1 text-sm admin-muted">{note.summary}</p><p className="mt-2 text-xs admin-muted">{note.category || "Uncategorized"} · {Math.max(1, Math.ceil(words / 200))} min read · edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</p></div><div className="flex items-center justify-end gap-1"><a href={`/notes/${note.slug}`} target="_blank" className="admin-icon-button" aria-label={`Preview ${note.title}`}><FaArrowUpRightFromSquare aria-hidden="true" /></a><Link href={editPath} className="admin-icon-button" aria-label={`Edit ${note.title}`}><FaPencil aria-hidden="true" /></Link>{note.type === "BLOG" && <DeleteButton id={note.id} />}</div></li>;
        })}</ul> : <div className="px-5 py-12"><p className="font-medium">No notes to show</p><p className="mt-1 text-sm admin-muted">{notes.length ? "Try another search or status." : "Start a draft when you have something worth sharing."}</p></div>}
      </section>
    </div>
  );
}
