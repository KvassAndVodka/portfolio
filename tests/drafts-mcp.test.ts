import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { createInterface } from "node:readline";
import test from "node:test";

import { isoWeekId } from "../scripts/drafts-mcp.mjs";

test("ISO week ids follow the Thursday rule", () => {
  assert.equal(isoWeekId(new Date(2026, 10, 12)), "2026-W46");
  assert.equal(isoWeekId(new Date(2027, 0, 1)), "2026-W53");
  assert.equal(isoWeekId(new Date(2024, 11, 30)), "2025-W01");
});

test("MCP server lists tools and forwards create_draft with the bearer token", async () => {
  const seen: { auth?: string; body?: Record<string, unknown>; url?: string; raw?: string } = {};
  const api = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      seen.auth = req.headers.authorization;
      seen.url = req.url;
      seen.raw = raw;
      if (req.url === "/api/drafts/media") return res.writeHead(201, { "content-type": "application/json" }).end('{"success":true,"url":"/api/media/abc.mp4"}');
      seen.body = JSON.parse(raw);
      res.writeHead(201, { "content-type": "application/json" }).end('{"success":true,"slug":"week-2026-w46"}');
    });
  });
  await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
  const { port } = api.address() as AddressInfo;

  const root = mkdtempSync(path.join(tmpdir(), "mcp-uploads-"));
  const outside = mkdtempSync(path.join(tmpdir(), "mcp-outside-"));
  writeFileSync(path.join(root, "clip.mp4"), "fake clip bytes");
  writeFileSync(path.join(outside, "secret.txt"), "do not send");
  symlinkSync(path.join(outside, "secret.txt"), path.join(root, "link.txt"));

  const child = spawn(process.execPath, ["scripts/drafts-mcp.mjs"], {
    env: { NODE_ENV: "test", PATH: process.env.PATH, PORTFOLIO_URL: `http://127.0.0.1:${port}`, DRAFTS_API_TOKEN: "test-token", UPLOAD_ROOTS: root },
  });
  const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
  const rpc = async (id: number, method: string, params?: unknown) => {
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return JSON.parse((await lines.next()).value);
  };

  try {
    const init = await rpc(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } });
    assert.equal(init.result.serverInfo.name, "portfolio-drafts");
    child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');

    const list = await rpc(2, "tools/list");
    assert.deepEqual(list.result.tools.map((t: { name: string }) => t.name), ["create_draft", "create_project_draft", "upload_media", "list_recent_posts"]);

    const call = await rpc(3, "tools/call", {
      name: "create_draft",
      arguments: { weekId: "2026-W46", title: "Week 46", summary: "What I built.", content: "Body" },
    });
    assert.equal(call.result.isError, undefined);
    assert.equal(seen.auth, "Bearer test-token");
    assert.equal(seen.body?.weekId, "2026-W46");
    assert.equal(seen.body?.type, undefined);

    const project = await rpc(4, "tools/call", {
      name: "create_project_draft",
      arguments: { title: "Postcard from the Map", summary: "A map.", content: "Body", techStack: ["Next.js"] },
    });
    assert.equal(project.result.isError, undefined);
    assert.equal(seen.body?.type, "PROJECT");
    assert.deepEqual(seen.body?.techStack, ["Next.js"]);

    const upload = await rpc(6, "tools/call", { name: "upload_media", arguments: { path: path.join(root, "clip.mp4") } });
    assert.equal(upload.result.isError, undefined);
    assert.match(upload.result.content[0].text, /api\/media\/abc\.mp4/);
    assert.equal(seen.url, "/api/drafts/media");
    assert.ok(seen.raw?.includes('filename="clip.mp4"') && seen.raw.includes("fake clip bytes"));

    // Outside the allowed folders, directly or through a symlink or "..", nothing is sent.
    for (const [id, file] of [[7, path.join(outside, "secret.txt")], [8, path.join(root, "link.txt")], [9, path.join(root, "..", path.basename(outside), "secret.txt")]] as const) {
      seen.raw = undefined;
      const refused = await rpc(id, "tools/call", { name: "upload_media", arguments: { path: file } });
      assert.equal(refused.result.isError, true);
      assert.equal(seen.raw, undefined);
    }

    const unknown = await rpc(5, "nope");
    assert.equal(unknown.error.code, -32601);
  } finally {
    child.kill();
    api.close();
  }
});

test("an owner run sees the owner tools, a capped run stops at its limit, and every call is audited", async () => {
  const calls: { url?: string; auth?: string; body: Record<string, unknown> }[] = [];
  const api = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      calls.push({ url: req.url, auth: req.headers.authorization, body: raw ? JSON.parse(raw) : {} });
      res.writeHead(200, { "content-type": "application/json" }).end('{"success":true}');
    });
  });
  await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
  const { port } = api.address() as AddressInfo;
  const auditLog = path.join(mkdtempSync(path.join(tmpdir(), "mcp-audit-")), "audit.jsonl");

  const child = spawn(process.execPath, ["scripts/drafts-mcp.mjs"], {
    env: { NODE_ENV: "test", PATH: process.env.PATH, PORTFOLIO_URL: `http://127.0.0.1:${port}`, CONTENT_OWNER_TOKEN: "owner-token", MCP_MAX_DRAFTS: "1", MCP_AUDIT_LOG: auditLog },
  });
  const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
  const rpc = async (id: number, method: string, params?: unknown) => {
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return JSON.parse((await lines.next()).value);
  };

  try {
    const list = await rpc(1, "tools/list");
    const names = list.result.tools.map((t: { name: string }) => t.name);
    for (const name of ["publish_post", "unpublish_post", "stage_edit", "trash_post"]) assert.ok(names.includes(name), name);

    const staged = await rpc(2, "tools/call", { name: "stage_edit", arguments: { slug: "live-post", content: "New body" } });
    assert.equal(staged.result.isError, undefined);
    assert.equal(calls.at(-1)?.url, "/api/drafts/owner");
    assert.equal(calls.at(-1)?.auth, "Bearer owner-token");
    assert.deepEqual(calls.at(-1)?.body, { slug: "live-post", content: "New body", action: "stage_edit" });

    const publish = await rpc(3, "tools/call", { name: "publish_post", arguments: { slug: "live-post--edit-1" } });
    assert.equal(publish.result.isError, undefined);
    assert.equal(calls.at(-1)?.body.action, "publish");

    // MCP_MAX_DRAFTS=1: the second draft never reaches the portfolio.
    const first = await rpc(4, "tools/call", { name: "create_draft", arguments: { title: "a", summary: "b", content: "c" } });
    assert.equal(first.result.isError, undefined);
    const sent = calls.length;
    const second = await rpc(5, "tools/call", { name: "create_draft", arguments: { title: "a", summary: "b", content: "c" } });
    assert.equal(second.result.isError, true);
    assert.equal(calls.length, sent);

    const audit = readFileSync(auditLog, "utf8").trim().split("\n").map((line) => JSON.parse(line));
    assert.deepEqual(audit.map((entry) => [entry.tool, entry.ok]), [["stage_edit", true], ["publish_post", true], ["create_draft", true], ["create_draft", false]]);
    assert.ok(audit.every((entry) => entry.content === undefined), "the audit log leaves content out");
  } finally {
    child.kill();
    api.close();
  }
});

test("a drafts-token run cannot call an owner tool, even by name", async () => {
  const child = spawn(process.execPath, ["scripts/drafts-mcp.mjs"], {
    env: { NODE_ENV: "test", PATH: process.env.PATH, PORTFOLIO_URL: "http://127.0.0.1:9", DRAFTS_API_TOKEN: "drafts-token" },
  });
  const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
  try {
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "publish_post", arguments: { slug: "x" } } }) + "\n");
    const reply = JSON.parse((await lines.next()).value);
    assert.equal(reply.result.isError, true);
    assert.match(reply.result.content[0].text, /Unknown tool/);
  } finally {
    child.kill();
  }
});
