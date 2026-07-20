import type { Metadata } from "next";

import ProjectShowcase from "@/components/ProjectShowcase";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected backend, infrastructure, full-stack, and applied AI projects by Javier Raut.",
};

export default function ProjectsPage() {
  return (
    <div>
      <section className="subpage-hero">
        <div className="site-shell">
          <h1 className="page-title">Backend and infrastructure projects.</h1>
          <p className="body-large mt-7">
            Case studies with the problem, my implementation, the technology, and links you can inspect.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <ScrollReveal className="site-shell">
          <ProjectShowcase />
        </ScrollReveal>
      </section>
    </div>
  );
}
