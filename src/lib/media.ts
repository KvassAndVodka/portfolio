// Clips are stored as uploaded. Their URL carries the extension, so Markdown, the editor and
// the public figure can tell a clip from an image by its source alone.
const VIDEO_EXTENSIONS: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm" };

export const isVideoSrc = (src: string) => /\.(mp4|webm)$/i.test(src);

export function mediaUrl(id: string, mimeType: string) {
  const extension = VIDEO_EXTENSIONS[mimeType];
  return `/api/media/${id}${extension ? `.${extension}` : ""}`;
}

/** The video type from the file's own bytes, never from the name or the browser's claim. */
export function sniffVideo(bytes: Uint8Array): "video/mp4" | "video/webm" | null {
  // MP4 and the other ISO media files: a box size, then "ftyp".
  if (bytes.length >= 12 && String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp") return "video/mp4";
  // WebM: the EBML header.
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "video/webm";
  return null;
}

/**
 * One byte range from a Range header, so Safari and iOS can play the clip.
 * Null means "send the whole file"; "invalid" means 416.
 */
export function parseRange(header: string | null, size: number): { start: number; end: number } | null | "invalid" {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  const [, from, to] = match;
  if (!from && !to) return "invalid";
  // "bytes=-500" is the last 500 bytes.
  const start = from ? Number(from) : Math.max(0, size - Number(to));
  const end = from && to ? Math.min(Number(to), size - 1) : size - 1;
  return start > end || start >= size ? "invalid" : { start, end };
}
