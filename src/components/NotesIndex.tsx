"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRef, useState } from "react";
import { FaArrowRight, FaRotateRight } from "react-icons/fa6";

import NoteSkeleton from "@/components/NoteSkeleton";
import Pagination, { paginate } from "@/components/Pagination";
import { useTimedFetch } from "@/hooks/useTimedFetch";
import { scrollBelowHeader } from "@/lib/lenis";
import type { PostPreview } from "@/lib/posts";

const PAGE_SIZE = 10;
const pad = (value: number) => String(value).padStart(2, "0");

type NotesIndexProps = Readonly<{
  initialNotes?: PostPreview[];
}>;

/** The notes as a numbered log on a paper sheet, newest first, ten to a page. */
export default function NotesIndex({ initialNotes }: NotesIndexProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const { data, retry, status } = useTimedFetch<{ notes: PostPreview[] }>(
    "/api/notes",
    4_000,
    initialNotes === undefined ? undefined : { notes: initialNotes },
  );

  if (status === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading notes">
        {Array.from({ length: 4 }, (_, index) => (
          <NoteSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (status === "timeout" || status === "error") {
    return (
      <div className="empty-state" role="status">
        <h2>{status === "timeout" ? "Notes took too long to load." : "Notes are unavailable right now."}</h2>
        <p>This page could not reach the writing archive. Try the request again in a moment.</p>
        <button className="postcard-button mt-6" type="button" onClick={retry}>
          <FaRotateRight aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  const notes = data?.notes ?? [];

  if (notes.length === 0) {
    return (
      <div className="empty-state notes-empty" role="status">
        <h2>No notes published yet.</h2>
        <p>
          This space is ready for technical write-ups, project retrospectives, and lessons worth keeping.
        </p>
      </div>
    );
  }

  const shown = paginate(notes, page, PAGE_SIZE);
  // A new page jumps back to the top of the sheet.
  const changePage = (next: number) => {
    setPage(next);
    if (sheetRef.current) scrollBelowHeader(sheetRef.current);
  };

  return (
    <>
      <div className="notes-sheet" ref={sheetRef}>
        <p className="notes-sheet-strip">
          <span>Log</span>
          <span>{pad(notes.length)} {notes.length === 1 ? "entry" : "entries"}</span>
          <span>Newest first</span>
        </p>
        <ol key={shown.page}>
          {shown.items.map((note) => (
            <li key={note.slug}>
              <Link className="archive-row" href={`/notes/${note.slug}`}>
                {/* Numbered from the first note, so a note keeps its number as newer ones arrive. */}
                <span className="archive-row-number">No. {pad(notes.length - notes.indexOf(note))}</span>
                <div>
                  <h2>
                    {note.title}
                    <span className="title-dot">.</span>
                  </h2>
                  <p>{note.summary}</p>
                </div>
                <span className="archive-row-meta">
                  <time dateTime={note.publishedAt}>{format(new Date(note.publishedAt), "d MMM yyyy")}</time>
                  <span>{note.readTime}</span>
                  <FaArrowRight aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <Pagination label="Note pages" page={shown.page} pages={shown.pages} onChange={changePage} />
    </>
  );
}
