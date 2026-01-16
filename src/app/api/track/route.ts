import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import geoip from 'geoip-lite';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { path } = body;

        if (!path) {
            return NextResponse.json({ error: "Path missing" }, { status: 400 });
        }

        // IP Extraction Logic
        // Tailscale Funnel and standard proxies use X-Forwarded-For
        const forwardedFor = req.headers.get('x-forwarded-for');
        const reqAny = req as any; 
        let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (reqAny.ip || '127.0.0.1');

        // Handle IPv6 mapped IPv4 (e.g. ::ffff:127.0.0.1)
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        // Debug Logging for Verification
        console.log(`[Analytics] Track: ${path} | IP: ${ip} | XFF: ${forwardedFor || 'None'}`);

        // Generate Hash (Anonymize for storage)
        const ipHash = crypto.createHash('sha256').update(ip + new Date().getDate()).digest('hex'); 

        const userAgent = req.headers.get('user-agent') || undefined;
        const referer = req.headers.get('referer') || undefined;
        
        // GeoIP Lookup
        let country, city;
        try {
            const geo = geoip.lookup(ip);
            if (geo) {
                country = geo.country;
                city = geo.city;
                console.log(`[Analytics] Geo: ${city}, ${country}`);
            }
        } catch (e) {
            console.warn("[Analytics] GeoIP lookup failed:", e);
        }

        await prisma.visit.create({
            data: {
                path,
                ipHash,
                userAgent,
                referer,
                country,
                city
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Analytics] Tracking Error:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}
