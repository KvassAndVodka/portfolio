import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import StagedEditNotice from "@/components/admin/StagedEditNotice";
import { updatePost } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, include: { revisionOf: { select: { title: true, slug: true, type: true } } } });
  if (post?.type !== "PROJECT") notFound();
  return (
    <>
    <StagedEditNotice live={post.revisionOf} />
    <PostForm key={`${post.updatedAt.toISOString()}:${post.status}`} action={updatePost.bind(null, post.id)} submitLabel="Save project" initialData={{ ...post, status: post.status, thumbnail: post.thumbnail, category: post.category, githubUrl: post.githubUrl, demoUrl: post.demoUrl, projectUrl: post.projectUrl }} />
    </>
  );
}
