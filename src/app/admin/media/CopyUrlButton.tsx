'use client';

import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from '@/components/admin/Toaster';

export default function CopyUrlButton({ url }: Readonly<{ url: string }>) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopied(true);
            toast('Image link on your clipboard', { label: 'Copied' });
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => toast("Couldn't copy the link", { tone: 'error' }));
    };

    return (
        <button
            onClick={handleCopy}
            className="admin-icon-button"
            aria-label={copied ? "Link copied" : "Copy link"}
            type="button"
        >
            {copied ? <FaCheck size={14} aria-hidden="true" /> : <FaCopy size={14} aria-hidden="true" />}
        </button>
    );
}
