import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import AdminPageHead from "@/components/admin/AdminPageHead";
import PostForm from "@/components/admin/PostForm";
import { updatePost } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (post?.type !== "PROJECT") notFound();
  return (
    <>
      <AdminPageHead kicker="Work · edit" title="Edit project" lead={post.title}>
        <Link href="/admin/projects" className="admin-button-secondary"><FaArrowLeft aria-hidden="true" />All projects</Link>
      </AdminPageHead>
      <div className="pt-10">
      <PostForm key={`${post.updatedAt.toISOString()}:${post.status}`} action={updatePost.bind(null, post.id)} submitLabel="Save project" initialData={{ ...post, status: post.status, thumbnail: post.thumbnail, category: post.category, githubUrl: post.githubUrl, demoUrl: post.demoUrl, projectUrl: post.projectUrl }} />
      </div>
    </>
  );
}
