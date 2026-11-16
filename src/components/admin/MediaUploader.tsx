'use client';

import { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from './Toaster';

type MediaUploaderProps = Readonly<{
    onUploadComplete?: (url: string) => void;
}>;

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
            toast(`${file.name} is in the library`, { label: 'Uploaded' });
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
            void handleFile(e.dataTransfer.files[0]);
        }
    };

    let state = (
        <>
            <FaCloudUploadAlt aria-hidden="true" className="text-2xl text-[var(--postcard-muted)]" />
            <span className="media-drop-title">{isDragging ? 'Drop it here' : 'Drop an image, or choose a file'}</span>
            <span className="media-drop-label">JPG, PNG or WebP</span>
        </>
    );
    if (isUploading) {
        state = (
            <>
                <FaSpinner aria-hidden="true" className="text-xl text-[var(--postcard-rust)] animate-spin [animation-duration:700ms]" />
                <span className="media-drop-label">Uploading…</span>
            </>
        );
    } else if (success) {
        state = (
            <>
                <FaCheck aria-hidden="true" className="text-xl text-[var(--admin-success)]" />
                <span className="media-drop-label">Uploaded</span>
            </>
        );
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    if (e.target.files?.[0]) void handleFile(e.target.files[0]);
                }}
            />
            <button
                type="button"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload an image"
                className="media-drop w-full"
                data-dragging={isDragging || undefined}
                data-error={error ? true : undefined}
                data-done={success ? true : undefined}
            >
                {state}
            </button>
            {error && (
                <p role="alert" className="media-drop-label mt-3 flex items-center gap-2 !text-[var(--admin-danger)]">
                    <FaTimes aria-hidden="true" /> {error}
                </p>
            )}
        </div>
    );
}
