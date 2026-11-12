'use client';

import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

export default function CopyUrlButton({ url }: Readonly<{ url: string }>) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => undefined);
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
