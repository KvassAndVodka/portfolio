import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseRange } from '@/lib/media';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    // A clip's URL ends in its extension; the record id is everything before it.
    const id = params.id.replace(/\.(mp4|webm)$/i, '');

    try {
        // Size and type first, so a range request reads only the bytes it asks for.
        const [meta] = await prisma.$queryRaw<{ mimeType: string; size: number }[]>`
            SELECT "mimeType", octet_length(data)::int AS size FROM "Media" WHERE id = ${id}`;

        if (!meta) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const { mimeType, size } = meta;
        const headers = new Headers();
        headers.set('Content-Type', mimeType);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Accept-Ranges', 'bytes');
        // Next strips Content-Length from route responses, and Cloudflare cannot cut byte ranges from
        // a cached body without one. Clips skip Cloudflare's cache so ranges reach this route.
        if (mimeType.startsWith('video/')) headers.set('Cloudflare-CDN-Cache-Control', 'no-store');

        // Safari and iOS only play a video they can fetch in byte ranges.
        const range = parseRange(req.headers.get('range'), size);
        if (range === 'invalid') {
            headers.set('Content-Range', `bytes */${size}`);
            return new NextResponse(null, { status: 416, headers });
        }
        if (range) {
            const [slice] = await prisma.$queryRaw<{ chunk: Uint8Array }[]>`
                SELECT substring(data FROM ${range.start + 1}::int FOR ${range.end - range.start + 1}::int) AS chunk FROM "Media" WHERE id = ${id}`;
            headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
            return new NextResponse(Uint8Array.from(slice.chunk), { status: 206, headers });
        }

        const media = await prisma.media.findUnique({ where: { id }, select: { data: true } });
        return new NextResponse(media?.data ?? null, { headers });

    } catch (error) {
        console.error("Media Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
