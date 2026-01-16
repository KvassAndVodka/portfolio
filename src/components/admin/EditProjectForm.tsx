'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/MarkdownEditor';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaGithub, FaLink, FaDesktop, FaImage } from 'react-icons/fa';
import MediaPicker from './MediaPicker';

interface EditProjectFormProps {
    initialData: {
        id: string;
        title: string;
        slug: string;
        summary: string;
        content: string;
        category?: string | null;
        techStack: string[];
        githubUrl?: string | null;
        demoUrl?: string | null;
        projectUrl?: string | null;
        isPinned: boolean;
        thumbnail?: string | null;
    };
    action: (formData: FormData) => Promise<void>;
}

export default function EditProjectForm({ initialData, action }: EditProjectFormProps) {
    const [thumbnail, setThumbnail] = useState(initialData.thumbnail || '');
    const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);

    return (
        <form action={action} className="space-y-8">
            <input type="hidden" name="thumbnail" value={thumbnail} />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Editor & Core Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Project Name</label>
                            <input
                                name="title"
                                defaultValue={initialData.title}
                                className="w-full bg-transparent text-2xl font-bold placeholder-stone-300 dark:placeholder-stone-700 border-b border-stone-200 dark:border-stone-800 focus:border-[var(--accent)] outline-none py-2 transition-colors"
                                placeholder="Project Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Slug (URL)</label>
                            <input
                                name="slug"
                                defaultValue={initialData.slug}
                                className="w-full bg-transparent text-sm font-mono text-stone-500 border-b border-stone-200 dark:border-stone-800 focus:border-[var(--accent)] outline-none py-3 transition-colors"
                                placeholder="project-slug"
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
                            placeholder="Brief summary of the project..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Case Study (Content)</label>
                        <div className="prose-editor min-h-[500px] border border-stone-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0c0a09]">
                            <MarkdownEditor 
                                defaultValue={initialData.content} 
                                name="content" 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Metadata & Links */}
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
                            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <input 
                                        name="isPinned" 
                                        type="checkbox" 
                                        id="isPinned" 
                                        defaultChecked={initialData.isPinned} 
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]" 
                                    />
                                    <label htmlFor="isPinned" className="text-sm font-medium">Pin to Home</label>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Card */}
                        <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 rounded-xl p-6 space-y-6 shadow-sm">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-white/10 pb-2 flex justify-between items-center">
                                <span>Thumbnail</span>
                                {thumbnail && (
                                     <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setThumbnail('');
                                        }}
                                        className="text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-2 py-1 rounded transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </h3>
                            <button 
                                type="button"
                                onClick={() => setShowThumbnailPicker(true)}
                                className="w-full relative aspect-video bg-stone-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-stone-200 dark:border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-[var(--accent)] hover:bg-stone-50 dark:hover:bg-white/10 transition-all group cursor-pointer"
                            >
                                {thumbnail ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-stone-400 group-hover:text-[var(--accent)] transition-colors">
                                        <div className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-200">
                                            <FaImage size={24} />
                                        </div>
                                        <span className="text-xs font-medium">Click to Add Image</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Project Details Card */}
                            <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 rounded-xl p-6 space-y-6 shadow-sm">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-white/10 pb-2">
                                Project Details
                            </h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-stone-500">Category</label>
                                <select 
                                    name="category"
                                    defaultValue={initialData.category || 'personal'}
                                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none appearance-none"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="professional">Professional</option>
                                    <option value="schoolwork">Schoolwork</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-stone-500">Tech Stack</label>
                                <input 
                                    name="techStack"
                                    defaultValue={initialData.techStack.join(', ')}
                                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none"
                                    placeholder="React, Next.js, etc."
                                />
                            </div>
                        </div>

                        {/* Links Card */}
                        <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 rounded-xl p-6 space-y-6 shadow-sm">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-white/10 pb-2">
                                URLs
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase text-stone-500">
                                        <FaGithub /> GitHub Repo
                                    </label>
                                    <input 
                                        name="githubUrl"
                                        defaultValue={initialData.githubUrl || ''}
                                        className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase text-stone-500">
                                        <FaDesktop /> Demo URL
                                    </label>
                                    <input 
                                        name="demoUrl"
                                        defaultValue={initialData.demoUrl || ''}
                                        className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none"
                                        placeholder="https://my-demo.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase text-stone-500">
                                        <FaLink /> Project Link
                                    </label>
                                    <input 
                                        name="projectUrl"
                                        defaultValue={initialData.projectUrl || ''}
                                        className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        </div>
                </div>
            </div>

            {showThumbnailPicker && (
                <MediaPicker 
                    onSelect={(url) => {
                        setThumbnail(url);
                        setShowThumbnailPicker(false);
                    }} 
                    onClose={() => setShowThumbnailPicker(false)} 
                />
            )}
        </form>
    );
}
