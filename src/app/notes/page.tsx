import type { Metadata } from "next";

import NotesIndex from "@/components/NotesIndex";
import { getPosts, toPostPreview } from "@/lib/posts";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Notes",
  description: "Technical notes on software engineering, data systems, infrastructure, and active projects by Javier Raut.",
  path: "/notes",
});

export default async function NotesPage() {
  const notes = await getPosts();

  return (
    <div>
      <section className="subpage-hero">
        <div className="site-shell">
          <h1 className="page-title">Technical notes and build logs.</h1>
          <p className="body-large mt-7">
            Software engineering, data systems, infrastructure, and lessons from active projects.
          </p>
        </div>
      </section>

      <section className="min-h-[45vh] py-20 md:py-28">
        <div className="site-shell max-w-6xl">
          <NotesIndex initialNotes={notes.map(toPostPreview)} />
        </div>
      </section>
    </div>
  );
}
