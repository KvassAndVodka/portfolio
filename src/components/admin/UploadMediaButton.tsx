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
                type="button"
                onClick={() => setShowPicker(true)}
                className="admin-button-primary"
            >
                <FaCloudUploadAlt size={16} aria-hidden="true" />
                <span>Upload</span>
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
