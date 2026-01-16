'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaCloudUploadAlt, FaSearch } from 'react-icons/fa';
import MediaUploader from './MediaUploader';
import { getRecentMedia } from '@/lib/actions';

interface MediaPickerProps {
    onSelect: (url: string, alt: string) => void;
    onClose: () => void;
    initialTab?: 'library' | 'upload';
}

interface MediaItem {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
}

export default function MediaPicker({ onSelect, onClose, initialTab = 'library' }: MediaPickerProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>(initialTab);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const items = await getRecentMedia();
            setMediaItems(items);
        } catch (error) {
            console.error('Failed to load media', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'library') {
            loadMedia();
        }
    }, [activeTab]);

    const handleUploadComplete = (url: string) => {
        // Switch to library and reload to show new image
        setActiveTab('library');
        loadMedia();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#0c0a09] w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-white/5">
                    <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Select Image</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <FaTimes className="text-stone-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-100 dark:border-white/5">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'library' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
                    >
                        <FaImage /> Library
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
                    >
                        <FaCloudUploadAlt /> Upload New
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50 dark:bg-black/20">
                    {activeTab === 'library' ? (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-20 text-center text-stone-400">Loading library...</div>
                            ) : mediaItems.length === 0 ? (
                                <div className="py-20 text-center text-stone-500">
                                    <p>No images found.</p>
                                    <button onClick={() => setActiveTab('upload')} className="text-[var(--accent)] hover:underline mt-2 text-sm font-bold">Upload one now</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {mediaItems.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => onSelect(item.url, item.filename)}
                                            className="group relative aspect-square bg-white dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-white/5 hover:border-[var(--accent)] focus:ring-2 ring-[var(--accent)] outline-none transition-all"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={item.url} 
                                                alt={item.filename}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-white truncate">{item.filename}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-12">
                            <div className="w-full max-w-md">
                                <MediaUploader onUploadComplete={handleUploadComplete} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-100 dark:border-white/5 bg-white dark:bg-[#0c0a09] text-xs text-stone-400 text-center">
                    Select an image to insert it into your post.
                </div>
            </div>
        </div>
    );
}
