import type { Post } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import AdminPageHead from "@/components/admin/AdminPageHead";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";

export default async function AdminTrash() {
  const deletedPosts = await prisma.post.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } });
  return (
    <>
      <AdminPageHead kicker="Return to sender" title="Trash" lead="Restore an item, or delete it forever. Deleting forever cannot be undone." />
      {deletedPosts.length > 0 ? (
        <ol aria-label="Deleted content">{deletedPosts.map((post, index) => <TrashItem key={post.id} post={post} position={index + 1} />)}</ol>
      ) : (
        <div className="py-14"><p className="font-semibold">Trash is empty</p><p className="site-muted mt-1">Deleted projects and notes stay here until you delete them forever.</p></div>
      )}
    </>
  );
}

function TrashItem({ post, position }: Readonly<{ post: Post; position: number }>) {
  return (
    <li data-reveal className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-[var(--line)] py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto]">
      <span className="admin-index">{String(position).padStart(2, "0")}</span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{post.title}</p>
        <p className="admin-label site-muted mt-1">{post.type === "PROJECT" ? "Project" : "Note"} · {post.deletedAt ? `deleted ${formatDistanceToNow(post.deletedAt, { addSuffix: true })}` : "deletion date unknown"}</p>
      </div>
      <div className="col-start-2 sm:col-start-auto"><DeleteButton id={post.id} isTrash /></div>
    </li>
  );
}
