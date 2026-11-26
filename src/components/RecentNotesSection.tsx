import { format } from "date-fns";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import type { PostPreview } from "@/lib/posts";

type RecentNotesSectionProps = Readonly<{
  notes: PostPreview[];
  totalCount: number;
}>;

const pad = (value: number) => String(value).padStart(2, "0");

export default function RecentNotesSection({ notes, totalCount }: RecentNotesSectionProps) {
  if (notes.length === 0) return null;

  return (
    <section className="recent-notes-stage" aria-labelledby="recent-notes-heading">
      <div className="site-shell">
        <div className="grid items-end gap-x-12 gap-y-5 lg:grid-cols-[auto_minmax(0,30rem)] lg:justify-between">
          <div>
            <h2 className="section-title" id="recent-notes-heading">
              Recent field notes<span className="title-dot">.</span>
            </h2>
          </div>
          <div className="grid gap-3">
            <p className="body-large site-muted">
              Build logs, architecture notes, and lessons written down while shipping.
            </p>
            <Link
              href="/notes"
              className="inline-flex min-h-11 w-fit items-center gap-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] underline-offset-4 hover:underline"
            >
              All notes
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="notes-sheet mt-12">
          <p className="notes-sheet-strip">
            <span>Log</span>
            <span>
              Showing {pad(notes.length)} of {pad(totalCount)}
            </span>
            <span>Newest first</span>
          </p>
          <ol>
            {notes.map((note, index) => (
              <li key={note.slug}>
                <Link className="archive-row" href={`/notes/${note.slug}`}>
                  <span className="archive-row-number">No. {pad(totalCount - index)}</span>
                  <div>
                    <h3>
                      {note.title}
                      <span className="title-dot">.</span>
                    </h3>
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
      </div>
    </section>
  );
}

