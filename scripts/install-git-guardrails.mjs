import { chmodSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const hooks = [resolve(projectRoot, ".husky", "pre-commit"), resolve(projectRoot, ".husky", "pre-push")];

for (const hook of hooks) chmodSync(hook, 0o755);

const result = spawnSync("git", ["config", "core.hooksPath", ".husky"], {
  cwd: projectRoot,
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log("Git guardrails installed. Local deployment targets cannot be pushed.");
