import type { Metadata } from "next";

import ProjectShowcase from "@/components/ProjectShowcase";
import { getProjects, toProjectPreview } from "@/lib/projects";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: "Selected product, data, infrastructure, and operational software projects by Javier Raut.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = (await getProjects()).map(toProjectPreview);

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
          <ProjectShowcase initialProjects={projects} loadImmediately />
        </div>
      </section>
    </div>
  );
}
