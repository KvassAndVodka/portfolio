import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { FaTrash } from 'react-icons/fa';
import AdminPageHead from '@/components/admin/AdminPageHead';
import { revalidatePath } from 'next/cache';
import UploadMediaButton from '@/components/admin/UploadMediaButton';
import { requireAdmin } from '@/lib/require-admin';

async function deleteMedia(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get('id') as string;
    if (id) {
        await prisma.media.delete({ where: { id } });
        revalidatePath('/admin/media');
    }
}

export default async function AdminMedia() {
    // Fetch only metadata, not the heavy blob data
    const mediaItems = await prisma.media.findMany({
        select: {
            id: true,
            filename: true,
            mimeType: true,
            createdAt: true,
            // Exclude 'data'
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <>
            <AdminPageHead kicker="Library" title="Media" lead="Images used across notes and projects.">
                <UploadMediaButton />
            </AdminPageHead>

            {mediaItems.length > 0 ? (
                <ul className="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 lg:grid-cols-4">
                    {mediaItems.map((item, index) => (
                        <li key={item.id} data-reveal className="admin-panel group overflow-hidden">
                            <div className="admin-subtle relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`/api/media/${item.id}`} alt={item.filename} className="size-full object-cover" loading="lazy" />
                            </div>
                            <div className="border-t border-[var(--line)] p-3">
                                <p className="admin-index">{String(index + 1).padStart(2, "0")}</p>
                                <p className="mt-1 truncate text-sm font-semibold" title={item.filename}>{item.filename}</p>
                                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2">
                                    <p className="site-muted font-mono text-[0.75rem]">{item.mimeType.split('/')[1]} · {format(new Date(item.createdAt), 'd MMM')}</p>
                                    <div className="-mr-2 ml-auto flex shrink-0">
                                        <CopyUrlButton url={`/api/media/${item.id}`} />
                                        <form action={deleteMedia}>
                                            <input type="hidden" name="id" value={item.id} />
                                            <button type="submit" className="admin-icon-button hover:!text-[var(--admin-danger)]" aria-label={`Delete ${item.filename}`}>
                                                <FaTrash size={14} aria-hidden="true" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="py-14">
                    <p className="font-semibold">No media yet</p>
                    <p className="site-muted mt-1">Upload an image here, or from the editor.</p>
                </div>
            )}
        </>
    );
}

// Simple client component for copying URL
// Since this file is async server component, we need to extract this
import CopyUrlButton from './CopyUrlButton';
