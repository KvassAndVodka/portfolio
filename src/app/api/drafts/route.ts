import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PostStatus, PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MAX_DRAFT_BODY_BYTES, draftSlug, parseDraftInput, projectSlug, tokenRole } from "@/lib/drafts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Why the job may not write over an existing post with this slug, or null when it may.
function blockedReason(
  existing: { status: PostStatus; type: PostType; deletedAt: Date | null; revisionOfId: string | null },
  type: PostType,
) {
  // Once the owner publishes, schedules, or trashes a post, the job must not touch it again.
  if (existing.status !== PostStatus.DRAFT || existing.deletedAt) return "This draft is no longer editable.";
  // A staged edit changes only through the owner door, so the weekly job cannot rewrite a pending edit.
  if (existing.revisionOfId) return "That slug is a staged edit of a live post.";
  if (existing.type !== type) return "That slug belongs to a different content type.";
  return null;
}

type DraftInput = NonNullable<ReturnType<typeof parseDraftInput>>;

async function parseDraftRequest(
  request: NextRequest,
): Promise<{ error: NextResponse } | { input: DraftInput }> {
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_DRAFT_BODY_BYTES) {
    return { error: NextResponse.json({ error: "Body too large." }, { status: 413 }) };
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON." }, { status: 400 }) };
  }
  const input = parseDraftInput(payload);
  if (!input) {
    return {
      error: NextResponse.json(
        {
          error:
            "Expected title (≤120), summary (≤300), content (≤50000). Notes also need weekId (YYYY-Www). Projects accept slug, category, techStack, outcome and https links.",
        },
        { status: 400 },
      ),
    };
  }
  return { input };
}

function buildDraftFields(input: DraftInput) {
  const isProject = input.type === "PROJECT";
  const slug = isProject ? input.slug ?? projectSlug(input.title) : draftSlug(input.weekId ?? "");
  const data = {
    title: input.title,
    summary: input.summary,
    content: input.content,
    ...(isProject
      ? {
          category: input.category ?? null,
          techStack: input.techStack ?? [],
          githubUrl: input.githubUrl ?? null,
          demoUrl: input.demoUrl ?? null,
          projectUrl: input.projectUrl ?? null,
          outcome: input.outcome ?? null,
        }
      : {}),
  };

  return {
    isProject,
    postType: isProject ? PostType.PROJECT : PostType.BLOG,
    slug,
    data,
    createCategory: isProject ? input.category ?? null : "Weekly",
  };
}

// Machine-only door for the content job: it can create or update DRAFT notes and case studies,
// never publish. The owner keeps the publish step.
export async function POST(request: NextRequest) {
  const role = tokenRole(request.headers.get("authorization"));
  if (!role) return unauthorized();

  const parsed = await parseDraftRequest(request);
  if ("error" in parsed) return parsed.error;

  const { isProject, postType, slug, data, createCategory } = buildDraftFields(parsed.input);
  if (!slug) {
    return NextResponse.json({ error: "Could not derive a slug. Send one explicitly." }, { status: 400 });
  }

  const existing = await prisma.post.findUnique({ where: { slug }, select: { status: true, type: true, deletedAt: true, revisionOfId: true } });
  const blocked = existing && blockedReason(existing, postType);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 409 });

  const post = await prisma.post.upsert({
    where: { slug },
    create: {
      ...data,
      slug,
      type: postType,
      status: PostStatus.DRAFT,
      category: createCategory,
    },
    update: data,
    select: { id: true, slug: true, type: true },
  });

  revalidatePath("/admin");
  revalidatePath(isProject ? "/admin/projects" : "/admin/notes");
  if (isProject) revalidatePath("/projects");
  const responseStatus = existing ? 200 : 201;
  console.info(JSON.stringify({ event: "content-api", role, action: "draft", slug: post.slug, status: responseStatus }));
  return NextResponse.json({ success: true, created: !existing, ...post }, { status: responseStatus });
}

// Recent note titles so the job can avoid repeating topics.
export async function GET(request: NextRequest) {
  if (!tokenRole(request.headers.get("authorization"))) return unauthorized();

  const posts = await prisma.post.findMany({
    where: { type: PostType.BLOG, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: 12,
    select: { title: true, slug: true, status: true, publishedAt: true },
  });
  return NextResponse.json({ posts });
}
