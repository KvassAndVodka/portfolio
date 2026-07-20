import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const targetFile = resolve(import.meta.dirname, "..", "deployment.env");
const target = readFileSync(targetFile, "utf8").trim();

if (target !== "DEPLOY_TARGET=production") {
  console.error("Push blocked: deployment.env must be DEPLOY_TARGET=production.");
  console.error("Switch it back from local before pushing production code.");
  process.exit(1);
}

console.log("Production deployment target verified.");
