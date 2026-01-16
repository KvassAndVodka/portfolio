'use client';

import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

export default function CopyUrlButton({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy} 
            className="p-2 bg-stone-800 text-white hover:bg-[var(--accent)] rounded-lg transition-colors"
            title="Copy URL"
            type="button"
        >
            {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
        </button>
    );
}
