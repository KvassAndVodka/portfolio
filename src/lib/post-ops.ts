import { PostStatus, PostType, type Post } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";

// The fields a staged edit carries over to the live post. Slug, type, pinning and dates stay with the live post.
export const EDITABLE_FIELDS = ["title", "summary", "content", "category", "techStack", "githubUrl", "demoUrl", "projectUrl", "thumbnail", "outcome"] as const;
export type EditableFields = Partial<Pick<Post, (typeof EDITABLE_FIELDS)[number]>>;

const pick = (post: EditableFields) => Object.fromEntries(EDITABLE_FIELDS.filter((key) => post[key] !== undefined).map((key) => [key, post[key]])) as EditableFields;

/** Every page that can show a post, public and admin. */
export function revalidateContent(...slugs: string[]) {
  for (const path of ["/", "/projects", "/notes", "/admin", "/admin/projects", "/admin/notes", "/admin/trash", "/admin/archives"]) revalidatePath(path);
  for (const slug of slugs) for (const base of ["/projects", "/notes", "/admin/projects", "/admin/notes"]) revalidatePath(`${base}/${slug}`);
  revalidateTag("projects", "max");
  revalidateTag("notes", "max");
}

/** Copies a staged edit onto its live post, then moves the edit to the trash. Returns the live post. */
export async function applyRevision(revision: Post) {
  if (!revision.revisionOfId) throw new Error("Not a staged edit.");
  const [live] = await prisma.$transaction([
    prisma.post.update({ where: { id: revision.revisionOfId }, data: pick(revision) }),
    prisma.post.update({ where: { id: revision.id }, data: { deletedAt: new Date(), revisionOfId: null } }),
  ]);
  return live;
}

/** Publishes a draft, or applies a staged edit to its live post. Returns the post that is now live. */
export async function publishPost(post: Post) {
  if (post.revisionOfId) return applyRevision(post);
  if (post.status === PostStatus.PUBLISHED) return post;
  return prisma.post.update({ where: { id: post.id }, data: { status: PostStatus.PUBLISHED, publishedAt: new Date() } });
}

/** Creates or updates the staged edit of a published post. The live post does not change. */
export async function stageEdit(live: Post, fields: EditableFields) {
  const existing = await prisma.post.findFirst({ where: { revisionOfId: live.id, deletedAt: null } });
  if (existing) return prisma.post.update({ where: { id: existing.id }, data: pick(fields) });
  return prisma.post.create({
    data: {
      ...pick(live),
      ...pick(fields),
      title: fields.title ?? live.title,
      summary: fields.summary ?? live.summary,
      content: fields.content ?? live.content,
      // A unique slug of its own; the live slug is the one that stays.
      slug: `${live.slug}--edit-${Date.now().toString(36)}`,
      type: live.type,
      status: PostStatus.DRAFT,
      revisionOfId: live.id,
    },
  });
}

/** Moves a post to the trash (restorable in /admin/trash) and closes the gap it leaves in the home page order. */
export async function trashPost(post: Post) {
  await prisma.$transaction([
    prisma.post.update({ where: { id: post.id }, data: { deletedAt: new Date(), isPinned: false, pinnedOrder: null } }),
    ...(post.isPinned && post.pinnedOrder !== null
      ? [prisma.post.updateMany({ where: { type: PostType.PROJECT, isPinned: true, pinnedOrder: { gt: post.pinnedOrder } }, data: { pinnedOrder: { decrement: 1 } } })]
      : []),
  ]);
}
