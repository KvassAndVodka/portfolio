import Link from "next/link";
import AdminPageHead from "@/components/admin/AdminPageHead";
import SortableProjectList from "@/components/admin/SortableProjectList";
import { prisma } from "@/lib/prisma";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";

export default async function AdminProjects({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const filters = await searchParams;
  const projects = isAdminPreviewEnabled() ? [] : await prisma.post.findMany({
    where: { type: "PROJECT", deletedAt: null },
    orderBy: [{ isPinned: "desc" }, { pinnedOrder: "asc" }, { updatedAt: "desc" }],
  });
  return (
    <>
      <AdminPageHead kicker="Work" title="Projects" lead="Case studies, and the order they appear on the home page. Featured projects lead.">
        <Link href="/admin/create?type=PROJECT" className="admin-button-primary">New project</Link>
      </AdminPageHead>
      <SortableProjectList initialProjects={projects} initialHealth={typeof filters.health === "string" ? filters.health : undefined} />
    </>
  );
}
