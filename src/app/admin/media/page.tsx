import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaTrash, FaCopy, FaImage, FaCloudUploadAlt } from 'react-icons/fa';
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 rounded-2xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Media Library</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">Manage your uploaded images and assets.</p>
                </div>
                 <UploadMediaButton />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mediaItems.map((item) => (
                    <div key={item.id} className="group bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-[var(--accent)]/50 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5">
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
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                <CopyUrlButton url={`/api/media/${item.id}`} />
                                <form action={deleteMedia}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button className="p-2.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors backdrop-blur-md" title="Delete">
                                        <FaTrash size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="p-4 border-t border-stone-100 dark:border-white/5">
                            <p className="text-xs font-mono text-stone-600 dark:text-stone-300 truncate font-medium" title={item.filename}>{item.filename}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] tracking-wider font-bold text-stone-400 uppercase bg-stone-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{item.mimeType.split('/')[1]}</span>
                                <span className="text-[10px] text-stone-400">{format(new Date(item.createdAt), 'MMM dd')}</span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {mediaItems.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 dark:border-white/10 rounded-2xl bg-stone-50/50 dark:bg-white/5 mx-auto w-full">
                        <FaImage className="mx-auto text-stone-300 dark:text-stone-700 text-5xl mb-4" />
                        <p className="text-stone-500 font-medium">No media uploaded yet.</p>
                        <p className="text-sm text-stone-400 mt-2">Upload images while creating posts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple client component for copying URL
// Since this file is async server component, we need to extract this
import CopyUrlButton from './CopyUrlButton';
