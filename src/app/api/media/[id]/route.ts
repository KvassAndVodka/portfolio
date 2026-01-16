import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    try {
        const media = await prisma.media.findUnique({
            where: { id: params.id }
        });

        if (!media) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const headers = new Headers();
        headers.set('Content-Type', media.mimeType);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(media.data, {
            headers
        });

    } catch (error) {
        console.error("Media Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
