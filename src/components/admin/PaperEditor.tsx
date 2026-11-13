"use client";

import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { useState } from "react";
import { FaCode, FaImage, FaMinus, FaPlus, FaTable } from "react-icons/fa6";
import MediaPicker from "@/components/admin/MediaPicker";
import { editorExtensions } from "@/lib/editorExtensions";

const label = "font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]";
const menu = `${label} flex flex-wrap items-center rounded-[8px] bg-[var(--postcard-ink)] p-1 text-[var(--postcard-paper)] shadow-[0_12px_30px_-12px_rgb(0_0_0/50%)]`;
const menuButton = "min-h-9 rounded-[6px] px-2.5 hover:bg-[color-mix(in_srgb,var(--postcard-paper)_15%,transparent)] aria-pressed:text-[var(--postcard-orange)]";

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

function SelectionMenu({ editor }: Readonly<{ editor: Editor }>) {
  const [linking, setLinking] = useState(false);
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"), italic: e.isActive("italic"), link: e.isActive("link"), code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }), quote: e.isActive("blockquote"),
    }),
  });
  const buttons: Array<[string, boolean, () => void]> = [
    ["B", active.bold, () => editor.chain().focus().toggleBold().run()],
    ["I", active.italic, () => editor.chain().focus().toggleItalic().run()],
    ["Link", active.link, () => (active.link ? editor.chain().focus().unsetLink().run() : setLinking(true))],
    ["H2", active.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ["H3", active.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run()],
    ["Quote", active.quote, () => editor.chain().focus().toggleBlockquote().run()],
    ["Code", active.code, () => editor.chain().focus().toggleCode().run()],
  ];
  return (
    <BubbleMenu editor={editor} shouldShow={({ editor: e, from, to }) => from !== to && !e.isActive("table") && !e.isActive("image")} className={menu} role="toolbar" aria-label="Format selection">
      {linking ? (
        <form
          className="flex items-center"
          onSubmit={(event) => {
            event.preventDefault();
            const href = String(new FormData(event.currentTarget).get("href") || "").trim();
            if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
            setLinking(false);
          }}
        >
          <input name="href" type="url" required autoFocus aria-label="Link address" placeholder="https://…" className="min-h-9 w-56 bg-transparent px-2 font-sans text-sm normal-case tracking-normal outline-none" onKeyDown={(event) => { if (event.key === "Escape") { setLinking(false); editor.commands.focus(); } }} />
          <button type="submit" className={menuButton}>Add</button>
        </form>
      ) : (
        buttons.map(([text, pressed, run]) => <button key={text} type="button" aria-pressed={pressed} className={menuButton} onClick={run}>{text}</button>)
      )}
    </BubbleMenu>
  );
}

function TableMenu({ editor }: Readonly<{ editor: Editor }>) {
  const actions: Array<[string, () => boolean]> = [
    ["+ Row", () => editor.chain().focus().addRowAfter().run()],
    ["+ Column", () => editor.chain().focus().addColumnAfter().run()],
    ["− Row", () => editor.chain().focus().deleteRow().run()],
    ["− Column", () => editor.chain().focus().deleteColumn().run()],
    ["Delete table", () => editor.chain().focus().deleteTable().run()],
  ];
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={({ editor: e }) => e.isActive("table")}
      // Sit above the whole table, not the cell, so the menu never covers the header row.
      getReferencedVirtualElement={() => {
        const { node } = editor.view.domAtPos(editor.state.selection.from);
        const table = (node instanceof Element ? node : node.parentElement)?.closest("table");
        return table ? { getBoundingClientRect: () => table.getBoundingClientRect() } : null;
      }}
      options={{ placement: "top-start", offset: 10 }}
      className={menu}
      role="toolbar"
      aria-label="Edit table"
    >
      {actions.map(([text, run]) => <button key={text} type="button" className={menuButton} onClick={run}>{text}</button>)}
    </BubbleMenu>
  );
}

function InsertMenu({ editor, onImage }: Readonly<{ editor: Editor; onImage: () => void }>) {
  const [open, setOpen] = useState(false);
  const insert: Array<[string, React.ReactNode, () => void]> = [
    ["Image", <FaImage key="i" aria-hidden="true" />, onImage],
    ["Table", <FaTable key="t" aria-hidden="true" />, () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()],
    ["Code", <FaCode key="c" aria-hidden="true" />, () => editor.chain().focus().toggleCodeBlock().run()],
    ["Divider", <FaMinus key="d" aria-hidden="true" />, () => editor.chain().focus().setHorizontalRule().run()],
  ];
  return (
    <FloatingMenu editor={editor} options={{ placement: "left", offset: 12 }} className="flex items-center gap-2 max-md:hidden">
      <button
        type="button"
        aria-label={open ? "Close insert menu" : "Insert image, table, code block or divider"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`grid size-10 shrink-0 place-items-center rounded-full border border-[var(--postcard-tear)] bg-[var(--postcard-paper)] text-[var(--postcard-muted)] transition-transform hover:border-[var(--postcard-ink)] hover:text-[var(--postcard-ink)] ${open ? "rotate-45" : ""}`}
      >
        <FaPlus aria-hidden="true" />
      </button>
      {open && (
        <span className={menu} role="toolbar" aria-label="Insert">
          {insert.map(([text, icon, run]) => <button key={text} type="button" className={`${menuButton} flex items-center gap-1.5`} onClick={() => { setOpen(false); run(); }}>{icon}{text}</button>)}
        </span>
      )}
    </FloatingMenu>
  );
}

/**
 * The body of a note or case study, written on the paper sheet. Stores Markdown in a hidden `name` field.
 * The field keeps the original Markdown byte for byte until the body is edited, so opening and saving a post never rewrites it.
 */
export default function PaperEditor({ name, defaultValue = "", placeholder, onWords }: Readonly<{ name: string; defaultValue?: string; placeholder: string; onWords?: (words: number) => void }>) {
  const [value, setValue] = useState(defaultValue);
  const [source, setSource] = useState(false);
  const [picking, setPicking] = useState(false);

  const editor = useEditor({
    extensions: [...editorExtensions, Markdown, Placeholder.configure({ placeholder })],
    content: defaultValue,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose prose-lg article-prose max-w-none min-h-[40vh] outline-none", "aria-label": "Body", "aria-multiline": "true" } },
    onCreate: ({ editor: e }) => onWords?.(countWords(e.getText())),
    onUpdate: ({ editor: e }) => {
      setValue(e.getMarkdown());
      onWords?.(countWords(e.getText()));
    },
  });

  const toggleSource = () => {
    // Leaving the Markdown view loads the edited source back into the sheet.
    if (source) editor?.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
    setSource((s) => !s);
  };

  return (
    <div className="paper-editor">
      <input type="hidden" name={name} value={value} />
      {source ? (
        <textarea
          aria-label="Body as Markdown"
          value={value}
          onChange={(event) => { setValue(event.target.value); onWords?.(countWords(event.target.value)); }}
          className="min-h-[40vh] w-full resize-y bg-transparent font-mono text-[0.95rem] leading-[1.7] outline-none"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
      ) : (
        editor && (
          <>
            <SelectionMenu editor={editor} />
            <TableMenu editor={editor} />
            <InsertMenu editor={editor} onImage={() => setPicking(true)} />
            <EditorContent editor={editor} />
          </>
        )
      )}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[var(--postcard-tear)] pt-4">
        <p className="text-sm text-[var(--postcard-muted)] max-md:hidden">Select text to format it. Use + on an empty line for images, tables and code.</p>
        <div className="flex gap-2 md:hidden">
          <button type="button" className={`${label} min-h-11 rounded-[8px] border border-[var(--postcard-tear)] px-3`} onClick={() => setPicking(true)} disabled={source}>Image</button>
          <button type="button" className={`${label} min-h-11 rounded-[8px] border border-[var(--postcard-tear)] px-3`} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={source}>Table</button>
        </div>
        <button type="button" aria-pressed={source} onClick={toggleSource} className={`${label} min-h-11 rounded-[8px] px-3 text-[var(--postcard-muted)] hover:text-[var(--postcard-ink)]`}>{source ? "Back to the sheet" : "Edit as Markdown"}</button>
      </div>
      {picking && editor && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onSelect={(src) => { editor.chain().focus().setImage({ src, alt: "" }).run(); setPicking(false); }}
        />
      )}
    </div>
  );
}
