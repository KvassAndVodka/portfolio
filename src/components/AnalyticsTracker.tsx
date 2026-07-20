'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const track = async () => {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: pathname, event: 'page_view' }),
                    keepalive: true,
                });
            } catch {
                // Analytics never blocks navigation.
            }
        };

        if (pathname && !pathname.startsWith('/admin') && !pathname.startsWith('/auth')) {
            track();
        }
    }, [pathname]);

    return null;
}
