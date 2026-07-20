"use server";

import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

const PAGE_VIEW = "page_view";

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getVisitorStats(days = 30) {
  const rangeStart = startOfDay(subDays(new Date(), days - 1));
  const previousStart = startOfDay(subDays(rangeStart, days));
  const previousEnd = new Date(rangeStart.getTime() - 1);
  const pageViewFilter = { event: PAGE_VIEW };

  const [views, previousViews, visitors, previousVisitors, contactSubmissions] = await Promise.all([
    prisma.visit.count({ where: { ...pageViewFilter, createdAt: { gte: rangeStart } } }),
    prisma.visit.count({ where: { ...pageViewFilter, createdAt: { gte: previousStart, lte: previousEnd } } }),
    prisma.visit.groupBy({
      by: ["ipHash"],
      where: { ...pageViewFilter, ipHash: { not: null }, createdAt: { gte: rangeStart } },
    }),
    prisma.visit.groupBy({
      by: ["ipHash"],
      where: { ...pageViewFilter, ipHash: { not: null }, createdAt: { gte: previousStart, lte: previousEnd } },
    }),
    prisma.visit.count({ where: { event: "contact_submit", createdAt: { gte: rangeStart } } }),
  ]);

  return {
    days,
    views,
    visitors: visitors.length,
    contactSubmissions,
    viewsChange: percentageChange(views, previousViews),
    visitorsChange: percentageChange(visitors.length, previousVisitors.length),
  };
}

export async function getDailyVisits(days = 14) {
  const startDate = startOfDay(subDays(new Date(), days - 1));
  const visits = await prisma.visit.findMany({
    where: { event: PAGE_VIEW, createdAt: { gte: startDate } },
    select: { createdAt: true, ipHash: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped = new Map<string, { views: number; visitors: Set<string> }>();
  for (let index = 0; index < days; index += 1) {
    const date = subDays(new Date(), days - 1 - index);
    grouped.set(format(date, "yyyy-MM-dd"), { views: 0, visitors: new Set() });
  }

  for (const visit of visits) {
    const key = format(visit.createdAt, "yyyy-MM-dd");
    const bucket = grouped.get(key);
    if (!bucket) continue;
    bucket.views += 1;
    if (visit.ipHash) bucket.visitors.add(visit.ipHash);
  }

  return Array.from(grouped.entries()).map(([isoDate, value]) => ({
    isoDate,
    label: format(new Date(`${isoDate}T00:00:00`), "MMM d"),
    views: value.views,
    visitors: value.visitors.size,
  }));
}

export async function getTopPages(limit = 6, days = 30) {
  const rangeStart = startOfDay(subDays(new Date(), days - 1));
  const pages = await prisma.visit.groupBy({
    by: ["path"],
    where: {
      event: PAGE_VIEW,
      createdAt: { gte: rangeStart, lte: endOfDay(new Date()) },
      path: { notIn: ["/", "/auth/signin"] },
    },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: limit,
  });

  return pages.map((page) => ({ path: page.path, views: page._count.path }));
}

export async function getVisitorRegions(days = 30) {
  const rangeStart = startOfDay(subDays(new Date(), days - 1));
  const visits = await prisma.visit.findMany({
    where: {
      event: PAGE_VIEW,
      createdAt: { gte: rangeStart },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { latitude: true, longitude: true, city: true, country: true, ipHash: true },
  });

  const regions = new Map<string, {
    latitude: number;
    longitude: number;
    city: string | null;
    country: string | null;
    views: number;
    visitors: Set<string>;
  }>();

  for (const visit of visits) {
    if (visit.latitude === null || visit.longitude === null) continue;
    const latitude = Math.round(visit.latitude * 10) / 10;
    const longitude = Math.round(visit.longitude * 10) / 10;
    const key = `${latitude}:${longitude}`;
    const region = regions.get(key) ?? {
      latitude,
      longitude,
      city: visit.city,
      country: visit.country,
      views: 0,
      visitors: new Set<string>(),
    };
    region.views += 1;
    if (visit.ipHash) region.visitors.add(visit.ipHash);
    regions.set(key, region);
  }

  return Array.from(regions.values())
    .map((region) => ({ ...region, visitors: region.visitors.size }))
    .sort((a, b) => b.visitors - a.visitors || b.views - a.views)
    .slice(0, 40);
}

export async function getContentHealth() {
  const [drafts, scheduled, missingImages, missingProjectLinks] = await Promise.all([
    prisma.post.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.post.count({ where: { status: "SCHEDULED", deletedAt: null } }),
    prisma.post.count({ where: { thumbnail: null, deletedAt: null } }),
    prisma.post.count({
      where: {
        type: "PROJECT",
        deletedAt: null,
        githubUrl: null,
        demoUrl: null,
        projectUrl: null,
      },
    }),
  ]);

  return { drafts, scheduled, missingImages, missingProjectLinks };
}
