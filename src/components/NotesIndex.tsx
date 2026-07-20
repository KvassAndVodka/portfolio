"use client";

import { format } from "date-fns";
import Link from "next/link";
import { FaArrowRight, FaRotateRight } from "react-icons/fa6";

import NoteSkeleton from "@/components/NoteSkeleton";
import { useTimedFetch } from "@/hooks/useTimedFetch";
import type { PostPreview } from "@/lib/posts";

export default function NotesIndex() {
  const { data, retry, status } = useTimedFetch<{ notes: PostPreview[] }>("/api/notes");

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
        <button className="button-secondary mt-6" type="button" onClick={retry}>
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

  return (
    <div>
      {notes.map((note) => (
        <Link className="archive-row" href={`/notes/${note.slug}`} key={note.slug}>
          <time dateTime={note.publishedAt}>{format(new Date(note.publishedAt), "MMM d, yyyy")}</time>
          <div>
            <h2>{note.title}</h2>
            <p>{note.summary}</p>
          </div>
          <span className="archive-row-meta">
            {note.readTime}
            <FaArrowRight aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
