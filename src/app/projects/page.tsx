import type { Metadata } from "next";

import ProjectShowcase from "@/components/ProjectShowcase";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected product, data, infrastructure, and operational software projects by Javier Raut.",
};

export default function ProjectsPage() {
  return (
    <div>
      <section className="subpage-hero">
        <div className="site-shell">
          <h1 className="page-title">Systems built to do real work.</h1>
          <p className="body-large mt-7">
            Case studies with the problem, my implementation, the technology, and links you can inspect.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="site-shell">
          <ProjectShowcase loadImmediately />
        </div>
      </section>
    </div>
  );
}
