'use client';

import MarkdownEditor from '@/components/MarkdownEditor';
import { FaSave } from 'react-icons/fa';

interface EditArchiveFormProps {
    initialData: {
        id: string;
        title: string;
        slug: string;
        summary: string;
        content: string;
        category?: string | null;
        techStack: string[];
        thumbnail?: string | null;
    };
    action: (formData: FormData) => Promise<void>;
}

export default function EditArchiveForm({ initialData, action }: EditArchiveFormProps) {

    return (
        <form action={action} className="space-y-8">

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Title</label>
                            <input
                                name="title"
                                defaultValue={initialData.title}
                                className="w-full bg-transparent text-2xl font-bold placeholder-stone-300 dark:placeholder-stone-700 border-b border-stone-200 dark:border-stone-800 focus:border-[var(--accent)] outline-none py-2 transition-colors"
                                placeholder="Post Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Slug (URL)</label>
                            <input
                                name="slug"
                                defaultValue={initialData.slug}
                                className="w-full bg-transparent text-sm font-mono text-stone-500 border-b border-stone-200 dark:border-stone-800 focus:border-[var(--accent)] outline-none py-3 transition-colors"
                                placeholder="post-slug-url"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Summary</label>
                        <textarea
                            name="summary"
                            defaultValue={initialData.summary}
                            rows={3}
                            className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg p-4 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all resize-none"
                            placeholder="Brief summary of the post..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Content</label>
                        <div className="prose-editor min-h-[500px] border border-stone-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0c0a09]">
                            <MarkdownEditor 
                                defaultValue={initialData.content} 
                                name="content" 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Metadata */}
                <div className="space-y-6">
                        <div className="sticky top-8 space-y-6">
                        
                        {/* Actions Card */}
                        <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                            <button 
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg"
                            >
                                <FaSave /> Save Changes
                            </button>
                        </div>

                        {/* Metadata Card */}
                            <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 rounded-xl p-6 space-y-6 shadow-sm">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-white/10 pb-2">
                                Settings
                            </h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-stone-500">Category</label>
                                <input 
                                    name="category"
                                    defaultValue={initialData.category || ''}
                                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none"
                                    placeholder="e.g. Tutorial"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-stone-500">Tags (comma separated)</label>
                                <input 
                                    name="techStack"
                                    defaultValue={initialData.techStack.join(', ')}
                                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none"
                                    placeholder="React, Next.js, Design"
                                />
                                <p className="text-[10px] text-stone-400">Used for search and filtering.</p>
                            </div>
                        </div>

                        </div>
                </div>
            </div>
        </form>
    );
}
