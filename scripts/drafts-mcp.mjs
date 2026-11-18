#!/usr/bin/env node
// MCP stdio server for the content pipeline: drafts and media for the weekly job, plus owner tools
// (publish, unpublish, stage an edit of a live post, trash) only when the owner token is set.
// Env: PORTFOLIO_URL (e.g. https://portfolio.jmraut.dev); DRAFTS_API_TOKEN and/or CONTENT_OWNER_TOKEN;
// UPLOAD_ROOTS (colon-separated folders upload_media may read; defaults to the vault and /root/larping/uploads);
// MCP_MAX_DRAFTS, MCP_MAX_UPLOADS (per-run caps, unset means none); MCP_AUDIT_LOG (append one JSON line per call).
// The server enforces what each token may do; the caps and the hidden tools keep a run from even trying.
// shortcut: hand-rolled JSON-RPC over stdio (tools only, no SDK); switch to @modelcontextprotocol/sdk if we need resources or prompts.
import { appendFile, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";

const baseUrl = (process.env.PORTFOLIO_URL || "").replace(/\/$/, "");
const ownerToken = process.env.CONTENT_OWNER_TOKEN || "";
// The owner token can do everything the drafts token can, so an owner run needs only that one.
const token = ownerToken || process.env.DRAFTS_API_TOKEN || "";
const caps = { drafts: Number(process.env.MCP_MAX_DRAFTS) || Infinity, uploads: Number(process.env.MCP_MAX_UPLOADS) || Infinity };
const used = { drafts: 0, uploads: 0 };
const auditLog = process.env.MCP_AUDIT_LOG || "";
const uploadRoots = (process.env.UPLOAD_ROOTS || "/root/vault:/root/larping/uploads").split(":").filter(Boolean);

export function isoWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // Thursday decides the ISO year
  const week = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const tools = [
  {
    name: "create_draft",
    description:
      "Create or update this week's DRAFT note on the portfolio. It never publishes; the owner reviews it in /admin. Fails with 409 once the owner has published the week's note.",
    inputSchema: {
      type: "object",
      properties: {
        weekId: { type: "string", pattern: String.raw`^\d{4}-W\d{2}$`, description: "ISO week, e.g. 2026-W46. Defaults to the current week." },
        title: { type: "string", maxLength: 120 },
        summary: { type: "string", maxLength: 300, description: "One or two sentences for the notes list." },
        content: { type: "string", maxLength: 50000, description: "MDX body. No JS expressions." },
      },
      required: ["title", "summary", "content"],
    },
  },
  {
    name: "create_project_draft",
    description:
      "Create or update a PROJECT draft (a case study) on the portfolio. It never publishes; the owner reviews it in /admin. Send only evidence you can support from the supplied notes: no invented metrics, no invented results.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", maxLength: 120 },
        summary: { type: "string", maxLength: 300, description: "One or two sentences for lists and link previews." },
        content: { type: "string", maxLength: 50000, description: "MDX body: the problem, the decisions, the tradeoffs, the outcome." },
        slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", description: "Optional. Derived from the title when omitted." },
        category: { type: "string", maxLength: 60, description: "e.g. Web Platform" },
        techStack: { type: "array", maxItems: 24, items: { type: "string", maxLength: 40 } },
        outcome: { type: "string", maxLength: 200, description: "One line for the project card: what changed. Qualitative is fine." },
        githubUrl: { type: "string", maxLength: 500, description: "Source repository (admin: Source). https:// only." },
        projectUrl: { type: "string", maxLength: 500, description: "Any other link, such as docs or a write-up (admin: Other link). Not the live site. https:// only." },
        demoUrl: { type: "string", maxLength: 500, description: "The live site or demo (admin: Live demo). https:// only." },
      },
      required: ["title", "summary", "content"],
    },
  },
  {
    name: "upload_media",
    description:
      'Add one image or clip (PNG, JPG, WebP, GIF, MP4 or WebM, up to 10 MB) to the portfolio media library and return its URL. Use the URL in a draft as ![alt](url "caption"). It never deletes or replaces a file.',
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "The file on this machine, inside the vault or /root/larping/uploads." } },
      required: ["path"],
    },
  },
  {
    name: "list_recent_posts",
    description: "List the 12 most recent notes (title, slug, status, date) so new drafts don't repeat topics.",
    inputSchema: { type: "object", properties: {} },
  },
];

const slugOnly = { type: "object", properties: { slug: { type: "string", maxLength: 120 } }, required: ["slug"] };
// Only with the owner token, and only when the owner asks: each of these changes what visitors see.
const ownerTools = [
  {
    name: "publish_post",
    description: "Publish a draft, or apply a staged edit to its live post. Use only when the owner explicitly asks to publish.",
    inputSchema: slugOnly,
  },
  {
    name: "unpublish_post",
    description: "Take a published post back to draft. Use only when the owner explicitly asks.",
    inputSchema: slugOnly,
  },
  {
    name: "stage_edit",
    description:
      "Stage changes to a PUBLISHED post as a linked draft. The live post does not change until the owner publishes the edit (publish_post with the edit's slug, or Published in /admin). Send only the fields that change.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", maxLength: 120, description: "The live post's slug." },
        title: { type: "string", maxLength: 120 },
        summary: { type: "string", maxLength: 300 },
        content: { type: "string", maxLength: 50000 },
        category: { type: "string", maxLength: 60 },
        outcome: { type: "string", maxLength: 200 },
        techStack: { type: "array", maxItems: 24, items: { type: "string", maxLength: 40 } },
        githubUrl: { type: "string", maxLength: 500, description: "Source repository. https:// only." },
        demoUrl: { type: "string", maxLength: 500, description: "The live site or demo. https:// only." },
        projectUrl: { type: "string", maxLength: 500, description: "Any other link. https:// only." },
        thumbnail: { type: "string", maxLength: 500, description: "A media library URL (/api/media/...) or https:// link." },
      },
      required: ["slug"],
    },
  },
  {
    name: "trash_post",
    description: "Move a post to the trash. The owner can restore it from /admin/trash. Use only when the owner explicitly asks.",
    inputSchema: slugOnly,
  },
];
const visibleTools = ownerToken ? [...tools, ...ownerTools] : tools;

async function callPortfolio(method, body, route = "/api/drafts") {
  if (!baseUrl || !token) throw new Error("PORTFOLIO_URL and DRAFTS_API_TOKEN (or CONTENT_OWNER_TOKEN) must be set.");
  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Portfolio returned ${res.status}: ${text.slice(0, 300)}`);
  return text;
}

async function uploadMedia(file) {
  if (!baseUrl || !token) throw new Error("PORTFOLIO_URL and DRAFTS_API_TOKEN (or CONTENT_OWNER_TOKEN) must be set.");
  // realpath first, so a symlink or "../" cannot reach outside the allowed folders.
  const real = await realpath(String(file ?? ""));
  if (!uploadRoots.some((root) => real.startsWith(path.resolve(root) + path.sep))) {
    throw new Error(`Only files under ${uploadRoots.join(" or ")} can be uploaded.`);
  }
  const form = new FormData();
  form.append("file", new Blob([await readFile(real)]), path.basename(real));
  const res = await fetch(`${baseUrl}/api/drafts/media`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Portfolio returned ${res.status}: ${text.slice(0, 300)}`);
  return text;
}

function spend(kind) {
  if (used[kind] >= caps[kind]) throw new Error(`This run has reached its limit of ${caps[kind]} ${kind}.`);
  used[kind] += 1;
}

const OWNER_ACTIONS = { publish_post: "publish", unpublish_post: "unpublish", stage_edit: "stage_edit", trash_post: "trash" };

async function callTool(name, args = {}) {
  if (!visibleTools.some((tool) => tool.name === name)) throw new Error(`Unknown tool: ${name}`);
  if (name === "create_draft" || name === "create_project_draft") {
    spend("drafts");
    const body = name === "create_draft" ? { ...args, weekId: args.weekId || isoWeekId() } : { ...args, type: "PROJECT" };
    return callPortfolio("POST", body);
  }
  if (name === "list_recent_posts") return callPortfolio("GET");
  if (name === "upload_media") {
    spend("uploads");
    return uploadMedia(args.path);
  }
  return callPortfolio("POST", { ...args, action: OWNER_ACTIONS[name] }, "/api/drafts/owner");
}

// One line per call: what was asked and whether it worked. Content is left out; slugs, titles and paths are enough.
async function audit(name, args, error) {
  if (!auditLog) return;
  const line = { at: new Date().toISOString(), tool: name, slug: args?.slug, title: args?.title, path: args?.path, ok: !error, ...(error ? { error: String(error.message ?? error).slice(0, 200) } : {}) };
  await appendFile(auditLog, JSON.stringify(line) + "\n").catch(() => {});
}

async function handle(msg) {
  switch (msg.method) {
    case "initialize":
      return {
        protocolVersion: msg.params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "portfolio-drafts", version: "1.0.0" },
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: visibleTools };
    case "tools/call":
      try {
        const text = await callTool(msg.params?.name, msg.params?.arguments);
        await audit(msg.params?.name, msg.params?.arguments);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        await audit(msg.params?.name, msg.params?.arguments, error);
        return { content: [{ type: "text", text: String(error.message ?? error) }], isError: true };
      }
    default:
      throw Object.assign(new Error(`Method not found: ${msg.method}`), { code: -32601 });
  }
}

function send(message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createInterface({ input: process.stdin }).on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return send({ id: null, error: { code: -32700, message: "Parse error" } });
    }
    if (msg.id === undefined) return; // notifications (e.g. notifications/initialized) need no reply
    try {
      send({ id: msg.id, result: await handle(msg) });
    } catch (error) {
      send({ id: msg.id, error: { code: error.code ?? -32603, message: String(error.message ?? error) } });
    }
  });
}
