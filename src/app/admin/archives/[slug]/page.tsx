import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { updatePost } from '@/lib/actions';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import EditArchiveForm from '@/components/admin/EditArchiveForm';

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
        where: { slug }
    });

    if (!post) notFound();

    // Bind ID to the Server Action
    const updateAction = updatePost.bind(null, post.id);

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/blogs" 
                        className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 transition-colors text-stone-500"
                    >
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Edit Archive Post</h1>
                        <p className="text-sm text-stone-500 font-mono">{post.slug}</p>
                    </div>
                </div>
            </div>

            <EditArchiveForm 
                initialData={{
                    ...post,
                    thumbnail: post.thumbnail || undefined,
                    category: post.category || undefined,
                }}
                action={updateAction}
            />
        </div>
    );
}
