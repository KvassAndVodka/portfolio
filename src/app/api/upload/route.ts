import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { requireAdmin } from "@/lib/require-admin";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Invalid file." }, { status: 400 });
        }
        if (file.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Process image with Sharp
        // Resize to max width of 1920px (prevent huge files), convert to WebP for performance
        const processedBuffer = await sharp(buffer, { limitInputPixels: 40_000_000 })
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // Save to Database
        const media = await prisma.media.create({
            data: {
                filename: file.name,
                mimeType: 'image/webp',
                data: Uint8Array.from(processedBuffer)
            }
        });

        revalidatePath('/admin/media');

        return NextResponse.json({ 
            success: true, 
            url: `/api/media/${media.id}` 
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
