import type { Metadata } from "next";

import NotesIndex from "@/components/NotesIndex";
import PageHead from "@/components/PageHead";
import SiteFooter from "@/components/SiteFooter";
import { getPosts, toPostPreview } from "@/lib/posts";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Notes",
  description: "Technical notes on software engineering, data systems, infrastructure, and active projects by Javier Raut.",
  path: "/notes",
});

export default async function NotesPage() {
  const notes = await getPosts();

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div>
      <PageHead
        labels={["Field notes", `${pad(notes.length)} ${notes.length === 1 ? "entry" : "entries"}`]}
        title="Technical notes and build logs"
        lead="Software engineering, data systems, infrastructure, and lessons from active projects."
      />

      <section className="page-body">
        <div className="site-shell max-w-5xl">
          <NotesIndex initialNotes={notes.map(toPostPreview)} />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
