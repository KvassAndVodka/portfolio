import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import PostForm from "@/components/admin/PostForm";
import { updatePost } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function EditNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.type !== "BLOG") notFound();
  return (
    <div className="space-y-6 pb-16">
      <header className="flex items-start gap-3"><Link href="/admin/notes" className="admin-icon-button" aria-label="Back to notes"><FaArrowLeft aria-hidden="true" /></Link><div><h1 className="admin-page-title">Edit note</h1><p className="mt-2 text-sm admin-muted">{post.title}</p></div></header>
      <PostForm key={`${post.updatedAt.toISOString()}:${post.status}`} action={updatePost.bind(null, post.id)} submitLabel="Save note" initialData={{ ...post, status: post.status, thumbnail: post.thumbnail, category: post.category, githubUrl: post.githubUrl, demoUrl: post.demoUrl, projectUrl: post.projectUrl }} />
    </div>
  );
}
