import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import { isVideoSrc } from "@/lib/media";

// A clip is an image node whose source is a video, so Markdown keeps `![alt](clip.mp4 "caption")` as is.
const ImageOrClip = Image.extend({
  parseHTML() {
    return [...(this.parent?.() ?? []), { tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const tag = isVideoSrc(String(HTMLAttributes.src ?? "")) ? "video" : "img";
    const clip = tag === "video" ? { controls: "", muted: "", playsinline: "", preload: "metadata" } : {};
    return [tag, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, clip)];
  },
});

/** The document schema of the paper editor. Shared with the Markdown round-trip test, so both use the same nodes. */
export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    // Markdown has no underline, and the public renderers would print it as plain text.
    underline: false,
    // Replaced by the highlighted code block below, which uses the same lowlight grammars as the public pages.
    codeBlock: false,
    link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
  }),
  CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
  ImageOrClip,
  TableKit.configure({ table: { resizable: false } }),
];
