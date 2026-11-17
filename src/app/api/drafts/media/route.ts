import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { tokenRole } from "@/lib/drafts";
import { mediaUrl } from "@/lib/media";
import { storeMedia } from "@/lib/media-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Machine door for the content job's pictures and clips: it can add a file to the media library,
// never delete or replace one. Posts still change only as drafts through /api/drafts.
export async function POST(request: NextRequest) {
  const role = tokenRole(request.headers.get("authorization"));
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Refuse an oversized body before reading it.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 413 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Expected multipart form data with a file field." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 413 });

  try {
    const media = await storeMedia(file.name, Buffer.from(await file.arrayBuffer()));
    revalidatePath("/admin/media");
    console.info(JSON.stringify({ event: "content-api", role, action: "media", id: media.id, status: 201 }));
    return NextResponse.json({ success: true, id: media.id, url: mediaUrl(media.id, media.mimeType) }, { status: 201 });
  } catch (error) {
    // sharp rejects anything that is neither an image nor a sniffed clip.
    console.error("Draft media upload failed:", error);
    return NextResponse.json({ error: "Not a supported image or clip." }, { status: 415 });
  }
}
