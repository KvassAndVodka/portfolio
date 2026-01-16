import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Process image with Sharp
        // Resize to max width of 1920px (prevent huge files), convert to WebP for performance
        const processedBuffer = await sharp(buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // Save to Database
        const media = await prisma.media.create({
            data: {
                filename: file.name,
                mimeType: 'image/webp',
                data: processedBuffer as any
            }
        });

        return NextResponse.json({ 
            success: true, 
            url: `/api/media/${media.id}` 
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
