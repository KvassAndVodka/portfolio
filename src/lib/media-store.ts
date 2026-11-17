import sharp from "sharp";

import { sniffVideo } from "@/lib/media";
import { prisma } from "@/lib/prisma";

/** Stores one file in the media library the way an upload does. Shared by the upload route and the site-file import. */
export async function storeMedia(filename: string, buffer: Buffer) {
  // A clip is stored as uploaded: re-encoding video here would be slow and lossy.
  const video = sniffVideo(buffer);
  // Images: resize to max width of 1920px (prevent huge files), convert to WebP for performance.
  // animated: keep every frame of a GIF or animated WebP instead of flattening to the first.
  const data = video ? buffer : await sharp(buffer, { animated: true, limitInputPixels: 40_000_000 })
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return prisma.media.create({
    data: { filename, mimeType: video ?? "image/webp", data: Uint8Array.from(data) },
    select: { id: true, mimeType: true },
  });
}
