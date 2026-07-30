import { NextResponse } from "next/server";

import { getProjectsStrict, toProjectPreview } from "@/lib/projects";
import { withTimeout } from "@/lib/withTimeout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PROJECT_QUERY_BUDGET_MS = 2_500;

export async function GET() {
  try {
    const projects = await withTimeout(getProjectsStrict(), PROJECT_QUERY_BUDGET_MS);

    return NextResponse.json(
      {
        projects: projects.map(toProjectPreview),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json(
      { error: { code: "PROJECTS_UNAVAILABLE", message: "Projects are temporarily unavailable." } },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "10",
        },
      },
    );
  }
}
