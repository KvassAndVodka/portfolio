'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { FaXmark } from 'react-icons/fa6';
import AdminTabs from './AdminTabs';
import MediaUploader from './MediaUploader';
import { getRecentMedia } from '@/lib/actions';

type MediaPickerProps = Readonly<{
    onSelect: (url: string, alt: string) => void;
    onClose: () => void;
    initialTab?: 'library' | 'upload';
}>;

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

    // A real modal <dialog>: the browser keeps focus inside it, puts it above everything, and closes it on Escape.
    const dialogRef = useRef<HTMLDialogElement>(null);
    // Before paint: until showModal() runs, the dialog would show unstyled for a frame.
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    useEffect(() => {
        let cancelled = false;
        void getRecentMedia().then((items) => {
            if (!cancelled) setMediaItems(items);
        }).catch(() => undefined).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    const handleUploadComplete = () => {
        // Switch to library and reload to show new image
        setActiveTab('library');
        void loadMedia();
    };

    let library: React.ReactNode;
    if (loading) {
        library = (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy="true" aria-label="Loading images">
                {Array.from({ length: 8 }, (_, index) => <div key={index} className="admin-skeleton aspect-square rounded-[2px]" />)}
            </div>
        );
    } else if (mediaItems.length === 0) {
        library = (
            <div className="grid min-h-[14rem] place-items-center text-center">
                <div>
                    <p className="admin-label site-muted">No images yet</p>
                    <button type="button" onClick={() => setActiveTab('upload')} className="admin-button-secondary mt-4">Upload the first one</button>
                </div>
            </div>
        );
    } else {
        library = (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
                {mediaItems.map((item) => (
                    <li key={item.id}>
                        <button type="button" onClick={() => onSelect(item.url, item.filename)} className="media-tile">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt="" loading="lazy" />
                            <span className="media-tile-name">{item.filename}</span>
                        </button>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <dialog
            ref={dialogRef}
            className="admin-modal media-sheet flex max-h-[85vh] w-[min(100%-2rem,48rem)] flex-col overflow-hidden"
            aria-labelledby="media-picker-title"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
                <header className="flex items-start justify-between gap-4 px-6 pt-6">
                    <div>
                        <p className="admin-label text-[var(--postcard-rust)]">Media</p>
                        <h3 id="media-picker-title" className="mt-2 text-[1.75rem] font-[620] leading-none tracking-[-0.035em]">
                            Choose an image<span className="text-[var(--postcard-orange)]">.</span>
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="admin-icon-button -mr-2 -mt-2" aria-label="Close media picker">
                        <FaXmark aria-hidden="true" />
                    </button>
                </header>

                <div className="mt-4 border-b border-[var(--line)] px-6">
                    <AdminTabs
                        label="Image source"
                        value={activeTab}
                        onChange={setActiveTab}
                        options={[{ value: 'library', text: 'Library', count: loading ? undefined : mediaItems.length }, { value: 'upload', text: 'Upload' }]}
                    />
                </div>

                <div className="admin-list-swap min-h-[18rem] flex-1 overflow-y-auto p-6" key={activeTab}>
                    {activeTab === 'library' ? library : <MediaUploader onUploadComplete={handleUploadComplete} />}
                </div>
        </dialog>
    );
}
