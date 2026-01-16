'use client';

import { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import MediaPicker from './MediaPicker';
import { useRouter } from 'next/navigation';

export default function UploadMediaButton() {
    const [showPicker, setShowPicker] = useState(false);
    const router = useRouter();

    const handleSelect = () => {
        // We don't really select here, just upload
        setShowPicker(false);
        router.refresh(); // Refresh to show new image in the list
    };

    return (
        <>
            <button 
                onClick={() => setShowPicker(true)}
                className="bg-stone-900 dark:bg-stone-100 text-white dark:text-black hover:opacity-90 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-stone-900/10 dark:shadow-white/5"
            >
                <FaCloudUploadAlt size={16} />
                <span>Upload Media</span>
            </button>

            {showPicker && (
                <MediaPicker 
                    initialTab="upload"
                    onSelect={handleSelect}
                    onClose={() => {
                        setShowPicker(false);
                        router.refresh();
                    }} 
                />
            )}
        </>
    );
}
