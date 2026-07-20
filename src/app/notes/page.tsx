import type { Metadata } from "next";

import NotesIndex from "@/components/NotesIndex";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notes",
  description: "Technical notes on software engineering, infrastructure, and applied AI by Javier Raut.",
};

export default function NotesPage() {
  return (
    <div>
      <section className="subpage-hero">
        <div className="site-shell">
          <h1 className="page-title">Technical notes and build logs.</h1>
          <p className="body-large mt-7">
            Software engineering, infrastructure, applied AI, and lessons from active projects.
          </p>
        </div>
      </section>

      <section className="min-h-[45vh] py-20 md:py-28">
        <ScrollReveal className="site-shell max-w-6xl">
          <NotesIndex />
        </ScrollReveal>
      </section>
    </div>
  );
}
