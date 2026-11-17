import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseRange } from '@/lib/media';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    // A clip's URL ends in its extension; the record id is everything before it.
    const id = params.id.replace(/\.(mp4|webm)$/i, '');

    try {
        const media = await prisma.media.findUnique({
            where: { id }
        });

        if (!media) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const size = media.data.length;
        const headers = new Headers();
        headers.set('Content-Type', media.mimeType);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Accept-Ranges', 'bytes');

        // Safari and iOS only play a video they can fetch in byte ranges.
        const range = parseRange(req.headers.get('range'), size);
        if (range === 'invalid') {
            headers.set('Content-Range', `bytes */${size}`);
            return new NextResponse(null, { status: 416, headers });
        }
        if (range) {
            headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
            headers.set('Content-Length', String(range.end - range.start + 1));
            return new NextResponse(media.data.subarray(range.start, range.end + 1), { status: 206, headers });
        }

        headers.set('Content-Length', String(size));
        return new NextResponse(media.data, {
            headers
        });

    } catch (error) {
        console.error("Media Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
