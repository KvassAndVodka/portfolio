import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { requireAdmin } from "@/lib/require-admin";
import { mediaUrl, sniffVideo } from "@/lib/media";

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

        // A clip is stored as uploaded: re-encoding video here would be slow and lossy.
        const video = sniffVideo(buffer);
        const mimeType = video ?? 'image/webp';
        // Images: resize to max width of 1920px (prevent huge files), convert to WebP for performance.
        // animated: keep every frame of a GIF or animated WebP instead of flattening to the first.
        const data = video ? buffer : await sharp(buffer, { animated: true, limitInputPixels: 40_000_000 })
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // Save to Database
        const media = await prisma.media.create({
            data: {
                filename: file.name,
                mimeType,
                data: Uint8Array.from(data)
            }
        });

        revalidatePath('/admin/media');

        return NextResponse.json({ 
            success: true, 
            url: mediaUrl(media.id, media.mimeType) 
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
