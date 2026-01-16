'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/MarkdownEditor'; 
import MediaPicker from './MediaPicker';
import { FaImage } from 'react-icons/fa';

interface PostFormProps {
    // ... same props ...
    initialData?: {
        id?: string;
        title: string;
        slug: string;
        summary: string;
        content: string;
        type: 'BLOG' | 'PROJECT';
        category?: string;
        techStack?: string[];
        githubUrl?: string;
        demoUrl?: string;
        projectUrl?: string;
        isPinned: boolean;
        showAsBlog: boolean;
        thumbnail?: string;
    };
    action: (formData: FormData) => Promise<void>;
    submitLabel: string;
}

export default function PostForm({ initialData, action, submitLabel }: PostFormProps) {
    const [type, setType] = useState<'BLOG' | 'PROJECT'>(initialData?.type || 'BLOG');
    const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);
    const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');

    return (
        <form action={action} className="space-y-6">
            {/* Type Selector Toggle */}
            <div className="flex justify-center mb-8">
                <div className="bg-stone-100 dark:bg-white/5 p-1 rounded-lg inline-flex">
                    <button
                        type="button"
                        onClick={() => setType('BLOG')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            type === 'BLOG' 
                            ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' 
                            : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                        }`}
                    >
                        Blog Post
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('PROJECT')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            type === 'PROJECT' 
                            ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' 
                            : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                        }`}
                    >
                        Project
                    </button>
                </div>
                {/* Hidden input to send type to server action */}
                <input type="hidden" name="type" value={type} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                     <label className="block text-sm font-medium mb-2">Thumbnail</label>
                     <div className="space-y-3">
                         <input type="hidden" name="thumbnail" value={thumbnail} />
                         
                         {/* Preview Area */}
                         <button 
                            type="button"
                            onClick={() => setShowThumbnailPicker(true)}
                            className="w-full relative aspect-video bg-stone-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-stone-200 dark:border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-[var(--accent)] transition-colors group"
                         >
                            {thumbnail ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Change Image</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-stone-400 text-center p-4">
                                    <div className="mx-auto mb-2 opacity-50">
                                        <FaImage size={32} />
                                    </div>
                                    <span className="text-xs font-medium">Select Image</span>
                                </div>
                            )}
                         </button>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input 
                            name="title" 
                            defaultValue={initialData?.title} 
                            required 
                            className="w-full p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10" 
                        />
                         {/* Hidden slug input to preserve existing slug on edit, or empty on create (triggering auto-gen) */}
                        <input type="hidden" name="slug" defaultValue={initialData?.slug} />
                    </div>
                </div>
            </div>

            {/* ... rest of form ... */}
            
            {showThumbnailPicker && (
                <MediaPicker 
                    onSelect={(url) => {
                        setThumbnail(url);
                        setShowThumbnailPicker(false);
                    }} 
                    onClose={() => setShowThumbnailPicker(false)} 
                />
            )}


            <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <textarea 
                    name="summary" 
                    defaultValue={initialData?.summary} 
                    required 
                    rows={3} 
                    className="w-full p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10" 
                />
            </div>

            {/* Project Specific Fields - Conditionally Rendered */}
            {type === 'PROJECT' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 bg-stone-50/50 dark:bg-white/5 rounded-xl border border-stone-200/50 dark:border-white/5 dashed">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Project Details</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select 
                                    name="category" 
                                    defaultValue={initialData?.category || 'personal'} 
                                    className="w-full p-3 rounded-lg bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="professional">Professional</option>
                                    <option value="schoolwork">Schoolwork</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Tech Stack (comma separated)</label>
                                <input 
                                    name="techStack" 
                                    defaultValue={initialData?.techStack?.join(', ')} 
                                    className="w-full p-3 rounded-lg bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10" 
                                    placeholder="React, Next.js, TypeScript" 
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">GitHub URL</label>
                                <input 
                                    name="githubUrl" 
                                    defaultValue={initialData?.githubUrl || ''} 
                                    className="w-full p-3 rounded-lg bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Demo URL</label>
                                <input 
                                    name="demoUrl" 
                                    defaultValue={initialData?.demoUrl || ''} 
                                    className="w-full p-3 rounded-lg bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Project URL</label>
                                <input 
                                    name="projectUrl" 
                                    defaultValue={initialData?.projectUrl || ''} 
                                    className="w-full p-3 rounded-lg bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
                <MarkdownEditor name="content" defaultValue={initialData?.content} />
            </div>

            <div className="flex items-center gap-6 p-4 bg-stone-50 dark:bg-white/5 rounded-lg border border-stone-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <input 
                        name="isPinned" 
                        type="checkbox" 
                        id="isPinned" 
                        defaultChecked={initialData?.isPinned} 
                        className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]" 
                    />
                    <label htmlFor="isPinned" className="text-sm font-medium">Pin to Home</label>
                </div>
                
                {/* ShowAsBlog is relevant for Projects, but maybe also for Blogs (redundant but harmless) */}
                {type === 'PROJECT' && (
                     <div className="flex items-center gap-2">
                        <input 
                            name="showAsBlog" 
                            type="checkbox" 
                            id="showAsBlog" 
                            defaultChecked={initialData?.showAsBlog} 
                            className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]" 
                        />
                        <label htmlFor="showAsBlog" className="text-sm font-medium">Show in Blog Archives</label>
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity mt-8"
            >
                {submitLabel}
            </button>
        </form>
    );
}


