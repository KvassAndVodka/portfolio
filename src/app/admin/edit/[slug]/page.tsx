import { updatePost } from '@/lib/actions';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';

export default async function EditPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  const post = await prisma.post.findUnique({
    where: { slug: params.slug }
  });

  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <PostForm 
        initialData={{
            ...post,
            category: post.category || undefined,
            githubUrl: post.githubUrl || undefined,
            demoUrl: post.demoUrl || undefined,
            projectUrl: post.projectUrl || undefined
        }} 
        action={updatePostWithId} 
        submitLabel="Save Changes" 
      />
    </div>
  );
}
