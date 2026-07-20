import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const diff = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
  cwd: projectRoot,
  encoding: "utf8",
});

if (diff.error) throw diff.error;
if (diff.status !== 0) process.exit(diff.status ?? 1);

const files = diff.stdout
  .split("\n")
  .map((file) => file.trim())
  .filter((file) => /\.(?:js|jsx|mjs|ts|tsx)$/.test(file))
  .filter((file) => existsSync(resolve(projectRoot, file)));

if (files.length === 0) {
  console.log("No staged JavaScript or TypeScript files to lint.");
  process.exit(0);
}

const eslint = resolve(projectRoot, "node_modules", "eslint", "bin", "eslint.js");
const result = spawnSync(process.execPath, [eslint, "--config", "eslint.config.mjs", ...files], {
  cwd: projectRoot,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
