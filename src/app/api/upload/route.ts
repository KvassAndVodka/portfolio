import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from "@/lib/require-admin";
import { mediaUrl } from "@/lib/media";
import { storeMedia } from "@/lib/media-store";

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

        const media = await storeMedia(file.name, Buffer.from(await file.arrayBuffer()));

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
