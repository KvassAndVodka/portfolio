import { NextResponse } from "next/server";

import { getProjectsStrict } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await getProjectsStrict();

    return NextResponse.json(
      {
        projects: projects.map((project) => ({
          slug: project.slug,
          title: project.title,
          summary: project.summary,
          techStack: project.techStack,
          githubUrl: project.githubUrl,
          demoUrl: project.demoUrl,
          projectUrl: project.projectUrl,
          category: project.category,
          isPinned: project.isPinned,
          thumbnail: project.thumbnail,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json(
      { error: { code: "PROJECTS_UNAVAILABLE", message: "Projects are temporarily unavailable." } },
      { status: 503 },
    );
  }
}
