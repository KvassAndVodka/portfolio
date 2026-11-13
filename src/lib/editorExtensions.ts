import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

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
  Image,
  TableKit.configure({ table: { resizable: false } }),
];
