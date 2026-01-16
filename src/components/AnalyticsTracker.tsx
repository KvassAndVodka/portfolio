'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Debounce or just fire? Fire is fine for now, maybe small timeout to ensure it's not a rapid redirect.
        const track = async () => {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: pathname })
                });
            } catch (err) {
                // Ignore tracking errors
            }
        };

        if (pathname && !pathname.startsWith('/admin')) { // Don't track admin pages
            track();
        }
    }, [pathname]);

    return null;
}
