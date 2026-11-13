import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";

/** The document schema of the paper editor. Shared with the Markdown round-trip test, so both use the same nodes. */
export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    // Markdown has no underline, and the public renderers would print it as plain text.
    underline: false,
    link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
  }),
  Image,
  TableKit.configure({ table: { resizable: false } }),
];
