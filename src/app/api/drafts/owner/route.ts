import { NextRequest, NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";

import { MAX_DRAFT_BODY_BYTES, parseEditFields, tokenRole } from "@/lib/drafts";
import { scheduleIndexNow, urlsForPost } from "@/lib/indexnow";
import { publishPost, revalidateContent, stageEdit, trashPost } from "@/lib/post-ops";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACTIONS = ["publish", "unpublish", "stage_edit", "trash"] as const;
type Action = (typeof ACTIONS)[number];

const reply = (status: number, body: Record<string, unknown>) => NextResponse.json(body, { status });

function notifyIfPublished(post: { slug: string; type: Parameters<typeof urlsForPost>[0]["type"]; showAsBlog: boolean; status: PostStatus }) {
  if (post.status === PostStatus.PUBLISHED) {
    scheduleIndexNow(urlsForPost(post));
  }
}

async function handleStageEdit(
  post: NonNullable<Awaited<ReturnType<typeof prisma.post.findUnique>>>,
  body: Record<string, unknown>,
  log: (status: number, extra?: Record<string, unknown>) => void,
) {
  if (post.status !== PostStatus.PUBLISHED || post.revisionOfId) {
    log(409);
    return reply(409, { error: "Only a published post takes a staged edit. Update a draft through /api/drafts." });
  }
  const fields = parseEditFields(body);
  if (!fields) {
    log(400);
    return reply(400, { error: "Send at least one valid field: title, summary, content, category, outcome, techStack, githubUrl, demoUrl, projectUrl, thumbnail." });
  }
  const edit = await stageEdit(post, fields);
  revalidateContent(edit.slug);
  log(200, { edit: edit.slug });
  return reply(200, { success: true, slug: edit.slug, editOf: post.slug, status: edit.status });
}

// The owner's door: publish, unpublish, stage an edit of a live post, or move a post to the trash.
// The weekly job's drafts token is refused here, so only an owner-instructed run can change what is live.
export async function POST(request: NextRequest) {
  const role = tokenRole(request.headers.get("authorization"));
  if (!role) return reply(401, { error: "Unauthorized" });

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_DRAFT_BODY_BYTES) return reply(413, { error: "Body too large." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: "Invalid JSON." });
  }
  const action = body?.action as Action;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!ACTIONS.includes(action) || !slug) return reply(400, { error: `Send { action: ${ACTIONS.join(" | ")}, slug }.` });

  const log = (status: number, extra: Record<string, unknown> = {}) =>
    console.info(JSON.stringify({ event: "content-api", role, action, slug, status, ...extra }));
  if (role !== "owner") {
    log(403);
    return reply(403, { error: "This action needs the owner token." });
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.deletedAt) {
    log(404);
    return reply(404, { error: "No post with that slug (or it is in the trash)." });
  }

  if (action === "publish") {
    const live = await publishPost(post);
    revalidateContent(post.slug, live.slug);
    scheduleIndexNow(urlsForPost(live));
    log(200, { live: live.slug });
    return reply(200, { success: true, slug: live.slug, status: live.status, appliedEdit: post.revisionOfId !== null });
  }

  if (action === "unpublish") {
    if (post.revisionOfId) return reply(409, { error: "This is a staged edit; trash it instead." });
    const draft = await prisma.post.update({ where: { id: post.id }, data: { status: PostStatus.DRAFT } });
    revalidateContent(post.slug);
    notifyIfPublished(post);
    log(200);
    return reply(200, { success: true, slug: draft.slug, status: draft.status });
  }

  if (action === "trash") {
    await trashPost(post);
    revalidateContent(post.slug);
    notifyIfPublished(post);
    log(200);
    return reply(200, { success: true, slug: post.slug, trashed: true });
  }

  // stage_edit: the live post stays as it is until the owner publishes the edit.
  return handleStageEdit(post, body, log);
}
