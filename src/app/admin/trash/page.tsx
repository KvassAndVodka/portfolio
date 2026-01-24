import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaTrash, FaUndo, FaArrowLeft } from 'react-icons/fa';
import DeleteButton from '@/components/admin/DeleteButton';
import { PostType } from '@prisma/client';

export default async function AdminTrash() {
    const deletedPosts = await prisma.post.findMany({
        where: { NOT: { deletedAt: null } },
        orderBy: { deletedAt: 'desc' }
    });

    const projects = deletedPosts.filter(p => p.type === PostType.PROJECT);
    const blogs = deletedPosts.filter(p => p.type === PostType.BLOG);

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 rounded-2xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 shadow-sm">
                <div>
                     <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Trash</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">Manage deleted items. Restore them or delete forever.</p>
                </div>
                <Link 
                    href="/admin/projects" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 font-medium rounded-xl hover:opacity-90 transition-all"
                >
                    <FaArrowLeft size={14} />
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            <div className="space-y-8">
                {/* Projects Section */}
                {projects.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-white/10 pb-2">
                            Deleted Projects
                        </h2>
                        <div className="grid gap-4">
                            {projects.map(post => (
                                <TrashItem key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Blogs Section */}
                {blogs.length > 0 && (
                    <div className="space-y-4">
                         <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-white/10 pb-2">
                            Deleted Archives
                        </h2>
                        <div className="grid gap-4">
                            {blogs.map(post => (
                                <TrashItem key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}

                {deletedPosts.length === 0 && (
                    <div className="text-center py-20 rounded-2xl border border-dashed border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/5">
                        <p className="text-stone-500">Trash is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TrashItem({ post }: { post: any }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate opacity-70">
                    {post.title}
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                    Deleted {post.deletedAt ? format(new Date(post.deletedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                </p>
            </div>
            <DeleteButton id={post.id} isTrash={true} />
        </div>
    )
}
