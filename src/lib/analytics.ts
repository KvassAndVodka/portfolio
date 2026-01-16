"use server";

import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';

export async function getVisitorStats() {
    const totalViews = await prisma.visit.count();
    
    // Unique visitors (count distinct ipHash)
    // Prisma 'distinct' count is not directly supported in simple count(), using groupBy or raw query
    // Faster to just group by ipHash and count result length for large datasets, 
    // but for now simple findMany distinct is okay or just count distinct
    const uniqueVisitorsGroup = await prisma.visit.groupBy({
        by: ['ipHash'],
        _count: {
            ipHash: true
        }
    });
    const uniqueVisitors = uniqueVisitorsGroup.length;

    const todayStart = startOfDay(new Date());
    const viewsToday = await prisma.visit.count({
        where: {
            createdAt: {
                gte: todayStart
            }
        }
    });

    return { totalViews, uniqueVisitors, viewsToday };
}

export async function getDailyVisits(days = 14) {
    const startDate = subDays(new Date(), days);
    
    // Raw query might be better for time-series gap filling, 
    // but doing it in JS is easier for portability
    const visits = await prisma.visit.findMany({
        where: {
            createdAt: {
                gte: startDate
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // Group by date
    const grouped = new Map<string, number>();
    
    // Initialize all days
    for (let i = 0; i <= days; i++) {
        const date = subDays(new Date(), days - i);
        grouped.set(format(date, 'MMM dd'), 0);
    }

    visits.forEach(v => {
        const dateStr = format(v.createdAt, 'MMM dd');
        if (grouped.has(dateStr)) {
            grouped.set(dateStr, (grouped.get(dateStr) || 0) + 1);
        }
    });

    return Array.from(grouped.entries()).map(([date, count]) => ({ date, count }));
}

export async function getTopPages(limit = 6) {
    const topPages = await prisma.visit.groupBy({
        by: ['path'],
        _count: {
            path: true
        },
        orderBy: {
            _count: {
                path: 'desc'
            }
        },
        take: limit,
    });

    return topPages.map(p => ({
        path: p.path,
        views: p._count.path
    }));
}

export async function getVisitorLocations(limit = 5) {
    const topCountries = await prisma.visit.groupBy({
        by: ['country'],
        _count: {
            country: true
        },
        where: {
            country: {
                not: null
            }
        },
        orderBy: {
            _count: {
                country: 'desc'
            }
        },
        take: limit,
    });

    return topCountries.map(c => ({
        country: c.country || 'Unknown',
        visitors: c._count.country
    }));
}
