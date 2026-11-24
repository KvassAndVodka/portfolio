import type { Metadata } from "next";

import PageHead from "@/components/PageHead";
import ProjectShowcase from "@/components/ProjectShowcase";
import SiteFooter from "@/components/SiteFooter";
import { getProjects, toProjectPreview } from "@/lib/projects";
import { createPageMetadata } from "@/lib/seo";

// Render against live DB on request (backed by 60s unstable_cache) so builds never bake empty HTML.
export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: "Selected product, data, infrastructure, and operational software projects by Javier Raut.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = (await getProjects()).map(toProjectPreview);

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div>
      <PageHead
        labels={["Atlas", `${pad(projects.length)} case studies`]}
        title="Systems built to do real work"
        lead="Case studies with the problem, my implementation, the technology, and links you can inspect."
      />

      <section className="page-body">
        <div className="site-shell">
          <ProjectShowcase initialProjects={projects} loadImmediately />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
