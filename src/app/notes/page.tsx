import type { Metadata } from "next";

import NotesIndex from "@/components/NotesIndex";

export const metadata: Metadata = {
  title: "Notes",
  description: "Technical notes on software engineering, data systems, infrastructure, and active projects by Javier Raut.",
};

export default function NotesPage() {
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
          <NotesIndex />
        </div>
      </section>
    </div>
  );
}
