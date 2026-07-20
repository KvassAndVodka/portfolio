import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { FaTrash, FaImage } from 'react-icons/fa';
import { revalidatePath } from 'next/cache';
import UploadMediaButton from '@/components/admin/UploadMediaButton';

async function deleteMedia(formData: FormData) {
    "use server";
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
        <div className="space-y-6 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="admin-page-title">Media</h1>
                    <p className="admin-muted mt-2 text-sm">Upload and reuse portfolio images.</p>
                </div>
                 <UploadMediaButton />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {mediaItems.map((item) => (
                    <div key={item.id} className="admin-panel group overflow-hidden">
                        <div className="aspect-square relative bg-stone-100 dark:bg-stone-900/50 flex items-center justify-center overflow-hidden">
                             {/* Server Image via API */}
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={`/api/media/${item.id}`} 
                                alt={item.filename} 
                                className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                loading="lazy" 
                            />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-black/65 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                <CopyUrlButton url={`/api/media/${item.id}`} />
                                <form action={deleteMedia}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button className="admin-icon-button !text-white hover:!bg-[var(--admin-danger)]" aria-label={`Delete ${item.filename}`}>
                                        <FaTrash size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="border-t border-[var(--admin-border)] p-3">
                            <p className="truncate text-xs font-medium" title={item.filename}>{item.filename}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs admin-muted">{item.mimeType.split('/')[1]}</span>
                                <span className="text-xs admin-muted">{format(new Date(item.createdAt), 'MMM d')}</span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {mediaItems.length === 0 && (
                    <div className="admin-panel col-span-full w-full px-5 py-16">
                        <FaImage className="admin-muted mb-4 text-3xl" />
                        <p className="font-medium">No media uploaded yet</p>
                        <p className="admin-muted mt-2 text-sm">Upload an image here or from a content editor.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple client component for copying URL
// Since this file is async server component, we need to extract this
import CopyUrlButton from './CopyUrlButton';
