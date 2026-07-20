import type { Post } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";

export default async function AdminTrash() {
  const deletedPosts = await prisma.post.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } });
  return <div className="space-y-6 pb-16"><header><h1 className="admin-page-title">Trash</h1><p className="mt-2 text-sm admin-muted">Restore content or permanently remove it. Permanent deletion cannot be undone.</p></header><section className="admin-panel overflow-hidden" aria-label="Deleted content">{deletedPosts.length > 0 ? <ul className="divide-y divide-[var(--admin-border)]">{deletedPosts.map((post) => <TrashItem key={post.id} post={post} />)}</ul> : <div className="px-5 py-12"><p className="font-medium">Trash is empty</p><p className="mt-1 text-sm admin-muted">Deleted projects and notes will remain recoverable here.</p></div>}</section></div>;
}

function TrashItem({ post }: { post: Post }) {
  return <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-medium">{post.title}</p><span className="admin-status admin-status-danger">Deleted {post.type === "PROJECT" ? "project" : "note"}</span></div><p className="mt-1 text-xs admin-muted">{post.deletedAt ? `Deleted ${formatDistanceToNow(post.deletedAt, { addSuffix: true })}` : "Deletion date unavailable"}</p></div><DeleteButton id={post.id} isTrash /></li>;
}
