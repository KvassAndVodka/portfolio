import { NextResponse } from "next/server";

import { getPostsStrict } from "@/lib/posts";
import { withTimeout } from "@/lib/withTimeout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTES_QUERY_BUDGET_MS = 2_500;

export async function GET() {
  try {
    const notes = await withTimeout(getPostsStrict(), NOTES_QUERY_BUDGET_MS);

    return NextResponse.json(
      {
        notes: notes.map((note) => ({
          slug: note.slug,
          title: note.title,
          publishedAt: note.publishedAt,
          summary: note.summary,
          readTime: note.readTime,
          category: note.category,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json(
      { error: { code: "NOTES_UNAVAILABLE", message: "Notes are temporarily unavailable." } },
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
