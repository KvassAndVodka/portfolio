import assert from "node:assert/strict";
import test from "node:test";

import { isVideoSrc, mediaUrl, parseRange, sniffVideo } from "@/lib/media";

test("a clip's URL carries its extension, an image's does not", () => {
  assert.equal(mediaUrl("abc", "video/mp4"), "/api/media/abc?clip=mp4");
  assert.equal(mediaUrl("abc", "video/webm"), "/api/media/abc?clip=webm");
  assert.equal(mediaUrl("abc", "image/webp"), "/api/media/abc");
  assert.ok(isVideoSrc("/api/media/abc?clip=mp4"));
  assert.ok(isVideoSrc("/case-studies/x/clip.mp4"), "static clips keep their extension");
  assert.ok(isVideoSrc("/api/media/abc.mp4"), "clip URLs from before the change still play");
  assert.ok(!isVideoSrc("/api/media/abc"));
  assert.ok(!isVideoSrc("/api/media/abc?clip=png"));
});

test("the video type comes from the file's bytes", () => {
  const mp4 = Uint8Array.from([0, 0, 0, 0x20, ...Buffer.from("ftypisom"), 0, 0, 0, 0]);
  const webm = Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]);
  assert.equal(sniffVideo(mp4), "video/mp4");
  assert.equal(sniffVideo(webm), "video/webm");
  assert.equal(sniffVideo(Uint8Array.from(Buffer.from("\x89PNG\r\n\x1a\n0000"))), null);
  assert.equal(sniffVideo(new Uint8Array()), null);
});

test("a Range header becomes one byte range, the whole file, or a 416", () => {
  assert.deepEqual(parseRange("bytes=0-99", 1000), { start: 0, end: 99 });
  assert.deepEqual(parseRange("bytes=900-", 1000), { start: 900, end: 999 });
  assert.deepEqual(parseRange("bytes=-100", 1000), { start: 900, end: 999 });
  assert.deepEqual(parseRange("bytes=0-5000", 1000), { start: 0, end: 999 });
  assert.equal(parseRange(null, 1000), null);
  assert.equal(parseRange("bytes=0-1,5-9", 1000), null);
  assert.equal(parseRange("bytes=-", 1000), "invalid");
  assert.equal(parseRange("bytes=1000-", 1000), "invalid");
  assert.equal(parseRange("bytes=50-10", 1000), "invalid");
});
