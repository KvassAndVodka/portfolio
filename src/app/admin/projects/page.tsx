import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaThumbtack, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import { toggleProjectPin, reorderProject, deletePost } from '@/lib/actions';

import SortableProjectList from '@/components/admin/SortableProjectList';

export default async function AdminProjects() {
    const projects = await prisma.post.findMany({
        where: { type: PostType.PROJECT, deletedAt: null },
        orderBy: [
            { isPinned: 'desc' }, 
            { pinnedOrder: 'asc' },
            { publishedAt: 'desc' }
        ]
    });

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 rounded-2xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Projects</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">Organize and showcase your portfolio projects.</p>
                </div>
                <Link 
                    href="/admin/create?type=PROJECT" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-stone-900/10 dark:shadow-white/5"
                >
                    <FaPlus size={14} />
                    <span>New Project</span>
                </Link>
            </div>

            {/* Sortable List */}
            <SortableProjectList initialProjects={projects} />
        </div>
    );
}

// Remove the helper functions (PinButton, OrderButton, DeleteButton) from here
// as they are now either in the Client Component or separate components.
// ... wait, DeleteButton might be needed if I didn't verify it in SortableProjectList.
// In SortableProjectList I left a placeholder. I should probably add Delete functionality there.
// Since Delete is a Server Action, I can pass a server action prop or import it directly.
// In Next.js client components can import server actions.

