import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PostStatus, PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MAX_DRAFT_BODY_BYTES, draftSlug, isValidDraftToken, parseDraftInput } from "@/lib/drafts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Machine-only door for the weekly content job: it can create or update DRAFT notes, never publish.
export async function POST(request: NextRequest) {
  if (!isValidDraftToken(request.headers.get("authorization"), process.env.DRAFTS_API_TOKEN)) return unauthorized();

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_DRAFT_BODY_BYTES) {
    return NextResponse.json({ error: "Body too large." }, { status: 413 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const input = parseDraftInput(payload);
  if (!input) {
    return NextResponse.json(
      { error: "Expected weekId (YYYY-Www), title (≤120), summary (≤300), content (≤50000)." },
      { status: 400 },
    );
  }

  const slug = draftSlug(input.weekId);
  const existing = await prisma.post.findUnique({ where: { slug }, select: { status: true, deletedAt: true } });
  // Once you publish, schedule, or trash the week's note, the job must not touch it again.
  if (existing && (existing.status !== PostStatus.DRAFT || existing.deletedAt)) {
    return NextResponse.json({ error: "This week's post is no longer a draft." }, { status: 409 });
  }

  const data = { title: input.title, summary: input.summary, content: input.content };
  const post = await prisma.post.upsert({
    where: { slug },
    create: { ...data, slug, type: PostType.BLOG, status: PostStatus.DRAFT, category: "Weekly" },
    update: data,
    select: { id: true, slug: true },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/notes");
  return NextResponse.json({ success: true, created: !existing, ...post }, { status: existing ? 200 : 201 });
}

// Recent note titles so the job can avoid repeating topics.
export async function GET(request: NextRequest) {
  if (!isValidDraftToken(request.headers.get("authorization"), process.env.DRAFTS_API_TOKEN)) return unauthorized();

  const posts = await prisma.post.findMany({
    where: { type: PostType.BLOG, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: 12,
    select: { title: true, slug: true, status: true, publishedAt: true },
  });
  return NextResponse.json({ posts });
}
