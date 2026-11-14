'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Client-side navigations keep the original document.referrer, so only the first view of a visit carries the source.
let sourceSent = false;

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const track = async (source: Record<string, string | undefined>) => {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: pathname, event: 'page_view', ...source }),
                    keepalive: true,
                });
            } catch {
                // Analytics never blocks navigation.
            }
        };

        if (pathname && !pathname.startsWith('/admin') && !pathname.startsWith('/auth')) {
            const params = new URLSearchParams(window.location.search);
            const source = sourceSent ? {} : { referrer: document.referrer, ref: params.get('ref') ?? params.get('utm_source') ?? undefined };
            sourceSent = true;
            void track(source);
        }
    }, [pathname]);

    return null;
}
