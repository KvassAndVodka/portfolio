import { prisma } from '@/lib/prisma';
import { mediaUrl } from '@/lib/media';
import { format } from 'date-fns';
import AdminPageHead from '@/components/admin/AdminPageHead';
import { revalidatePath } from 'next/cache';
import UploadMediaButton from '@/components/admin/UploadMediaButton';
import DeleteMediaButton from './DeleteMediaButton';
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
            <AdminPageHead kicker="Library" title="Media" lead="Images and clips used across notes and projects.">
                <UploadMediaButton />
            </AdminPageHead>

            {mediaItems.length > 0 ? (
                <ul className="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 lg:grid-cols-4">
                    {mediaItems.map((item, index) => (
                        <li key={item.id} data-reveal className="admin-panel group overflow-hidden">
                            <div className="admin-subtle relative aspect-[4/3] overflow-hidden">
                                {item.mimeType.startsWith('video/') ? (
                                    <video src={mediaUrl(item.id, item.mimeType)} aria-label={item.filename} className="size-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={mediaUrl(item.id, item.mimeType)} alt={item.filename} className="size-full object-cover" loading="lazy" />
                                )}
                            </div>
                            <div className="border-t border-[var(--line)] p-3">
                                <p className="admin-index">{String(index + 1).padStart(2, "0")}</p>
                                <p className="mt-1 truncate text-sm font-semibold" title={item.filename}>{item.filename}</p>
                                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2">
                                    <p className="site-muted font-mono text-[0.75rem]">{item.mimeType.split('/')[1]} · {format(new Date(item.createdAt), 'd MMM')}</p>
                                    <div className="-mr-2 ml-auto flex shrink-0">
                                        <CopyUrlButton url={mediaUrl(item.id, item.mimeType)} />
                                        <DeleteMediaButton id={item.id} filename={item.filename} action={deleteMedia} />
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="py-14">
                    <p className="font-semibold">No media yet</p>
                    <p className="site-muted mt-1">Upload an image or a clip here, or from the editor.</p>
                </div>
            )}
        </>
    );
}

// Simple client component for copying URL
// Since this file is async server component, we need to extract this
import CopyUrlButton from './CopyUrlButton';
