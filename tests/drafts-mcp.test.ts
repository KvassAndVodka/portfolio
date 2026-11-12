import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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
  const seen: { auth?: string; body?: Record<string, unknown> } = {};
  const api = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      seen.auth = req.headers.authorization;
      seen.body = JSON.parse(raw);
      res.writeHead(201, { "content-type": "application/json" }).end('{"success":true,"slug":"week-2026-w46"}');
    });
  });
  await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
  const { port } = api.address() as AddressInfo;

  const child = spawn(process.execPath, ["scripts/drafts-mcp.mjs"], {
    env: { NODE_ENV: "test", PATH: process.env.PATH, PORTFOLIO_URL: `http://127.0.0.1:${port}`, DRAFTS_API_TOKEN: "test-token" },
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
    assert.deepEqual(list.result.tools.map((t: { name: string }) => t.name), ["create_draft", "list_recent_posts"]);

    const call = await rpc(3, "tools/call", {
      name: "create_draft",
      arguments: { weekId: "2026-W46", title: "Week 46", summary: "What I built.", content: "Body" },
    });
    assert.equal(call.result.isError, undefined);
    assert.equal(seen.auth, "Bearer test-token");
    assert.equal(seen.body?.weekId, "2026-W46");

    const unknown = await rpc(4, "nope");
    assert.equal(unknown.error.code, -32601);
  } finally {
    child.kill();
    api.close();
  }
});
