#!/usr/bin/env node
// MCP stdio server for the weekly content job: exposes /api/drafts as two tools.
// Env: PORTFOLIO_URL (e.g. https://portfolio.jmraut.dev), DRAFTS_API_TOKEN.
// shortcut: hand-rolled JSON-RPC over stdio (tools only, no SDK); switch to @modelcontextprotocol/sdk if we need resources or prompts.
import { createInterface } from "node:readline";

const baseUrl = (process.env.PORTFOLIO_URL || "").replace(/\/$/, "");
const token = process.env.DRAFTS_API_TOKEN || "";

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
        weekId: { type: "string", pattern: "^\\d{4}-W\\d{2}$", description: "ISO week, e.g. 2026-W46. Defaults to the current week." },
        title: { type: "string", maxLength: 120 },
        summary: { type: "string", maxLength: 300, description: "One or two sentences for the notes list." },
        content: { type: "string", maxLength: 50000, description: "MDX body. No JS expressions." },
      },
      required: ["title", "summary", "content"],
    },
  },
  {
    name: "list_recent_posts",
    description: "List the 12 most recent notes (title, slug, status, date) so new drafts don't repeat topics.",
    inputSchema: { type: "object", properties: {} },
  },
];

async function callPortfolio(method, body) {
  if (!baseUrl || !token) throw new Error("PORTFOLIO_URL and DRAFTS_API_TOKEN must be set.");
  const res = await fetch(`${baseUrl}/api/drafts`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Portfolio returned ${res.status}: ${text.slice(0, 300)}`);
  return text;
}

async function callTool(name, args = {}) {
  if (name === "create_draft") return callPortfolio("POST", { ...args, weekId: args.weekId || isoWeekId() });
  if (name === "list_recent_posts") return callPortfolio("GET");
  throw new Error(`Unknown tool: ${name}`);
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
      return { tools };
    case "tools/call":
      try {
        return { content: [{ type: "text", text: await callTool(msg.params?.name, msg.params?.arguments) }] };
      } catch (error) {
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
