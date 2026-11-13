import assert from "node:assert/strict";
import test from "node:test";
import { getSchema } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";

import { editorExtensions } from "@/lib/editorExtensions";

const markdown = new MarkdownManager({ extensions: editorExtensions });
getSchema(editorExtensions); // throws if the extensions do not form a valid schema

// Everything a note or case study uses today, plus the tables #53 adds.
const sample = `## Why it exists

The House needed **one searchable record** instead of *scattered* spreadsheets. See [the repo](https://github.com/example/repo) and \`npm run build\`.

- Organized project data
- Hardened the system
  - Nested detail

1. First step
2. Second step

> A quote from the field.

\`\`\`ts
const answer = 42;
\`\`\`

![Map of the district](https://example.com/map.png)

| Area | Before | After |
| --- | --- | --- |
| Lookups | 3 days | 5 minutes |
| Records | 4 files | 1 table |

---

Final paragraph with ~~struck~~ text.`;

const roundTrip = (source: string) => markdown.serialize(markdown.parse(source));

test("the editor schema keeps every block and mark of a post through a Markdown round trip", () => {
  const once = roundTrip(sample);
  // Saving the same document twice gives the same Markdown, so edits never drift the content.
  assert.equal(roundTrip(once), once);
  // The parsed documents match, so nothing was dropped or changed in meaning.
  assert.deepEqual(markdown.parse(once), markdown.parse(sample));
  for (const piece of ["## Why it exists", "**one searchable record**", "*scattered*", "[the repo](https://github.com/example/repo)", "`npm run build`", "Nested detail", "2. Second step", "> A quote from the field.", "```ts\nconst answer = 42;\n```", "![Map of the district](https://example.com/map.png)", "| Lookups", "5 minutes", "~~struck~~"]) {
    assert.ok(once.includes(piece), `lost: ${piece}\n---\n${once}`);
  }
});
