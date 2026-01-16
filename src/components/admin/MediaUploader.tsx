'use client';

import { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

interface MediaUploaderProps {
    onUploadComplete?: (url: string) => void;
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setSuccess(true);
            if (onUploadComplete) {
                onUploadComplete(data.url);
            }
            
            // Reset success state after a delay to allow another upload
            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all gap-4
                    ${isDragging 
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                        : 'border-stone-200 dark:border-white/10 hover:border-[var(--accent)] hover:bg-stone-50 dark:hover:bg-white/5'
                    }
                    ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                    ${success ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0]);
                    }}
                />

                {isUploading ? (
                    <FaSpinner className="text-3xl text-[var(--accent)] animate-spin" />
                ) : success ? (
                    <div className="flex flex-col items-center gap-2 text-emerald-500">
                        <FaCheck className="text-3xl" />
                        <span className="font-bold">Uploaded!</span>
                    </div>
                ) : (
                    <>
                        <div className={`p-4 rounded-full bg-stone-100 dark:bg-white/10 text-stone-400 ${isDragging ? 'text-[var(--accent)] bg-[var(--accent)]/10' : ''}`}>
                            <FaCloudUploadAlt size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-stone-600 dark:text-stone-300">
                                {isDragging ? 'Drop it here!' : 'Click or Drag to Upload'}
                            </p>
                            <p className="text-xs text-stone-400 mt-1">
                                Supports JPG, PNG, WebP
                            </p>
                        </div>
                    </>
                )}

                {error && (
                     <div className="absolute bottom-4 flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-white p-2 rounded-lg shadow-sm">
                        <FaTimes /> {error}
                     </div>
                )}
            </div>
        </div>
    );
}
