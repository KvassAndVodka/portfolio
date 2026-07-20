import crypto from "crypto";
import geoip from "geoip-lite";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_EVENTS = new Set(["page_view", "contact_submit"]);
const EXCLUDED_PREFIXES = ["/admin", "/auth", "/api"];
const DEDUPLICATION_WINDOW_MS = 10_000;

function getClientAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("cf-connecting-ip") || forwarded || "127.0.0.1";
  return address.startsWith("::ffff:") ? address.slice(7) : address;
}

function anonymousVisitorId(address: string) {
  const secret = process.env.ANALYTICS_HASH_SECRET || process.env.AUTH_SECRET || "local-analytics-only";
  return crypto.createHmac("sha256", secret).update(address).digest("hex");
}

function isSafePath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && value.length <= 240;
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON", message: "Invalid tracking payload." } }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: { code: "INVALID_EVENT", message: "Invalid tracking event." } }, { status: 400 });
  }

  const fields = payload as Record<string, unknown>;
  const path = fields.path;
  const event = typeof fields.event === "string" ? fields.event : "page_view";
  if (!isSafePath(path) || !ALLOWED_EVENTS.has(event) || EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.json({ success: true, ignored: true });
  }

  try {
    const address = getClientAddress(request);
    const ipHash = anonymousVisitorId(address);
    const duplicate = await prisma.visit.findFirst({
      where: {
        path,
        event,
        ipHash,
        createdAt: { gte: new Date(Date.now() - DEDUPLICATION_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ success: true, deduplicated: true });

    const geo = geoip.lookup(address);
    await prisma.visit.create({
      data: {
        path,
        event,
        ipHash,
        userAgent: request.headers.get("user-agent")?.slice(0, 500),
        referer: request.headers.get("referer")?.slice(0, 500),
        country: geo?.country || null,
        city: geo?.city || null,
        latitude: geo?.ll?.[0] ?? null,
        longitude: geo?.ll?.[1] ?? null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[analytics] event could not be stored", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: { code: "TRACKING_FAILED", message: "Event could not be stored." } }, { status: 500 });
  }
}
