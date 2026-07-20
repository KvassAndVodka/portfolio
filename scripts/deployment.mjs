import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import bcrypt from "bcryptjs";

const projectRoot = resolve(import.meta.dirname, "..");
const targetFile = resolve(projectRoot, "deployment.env");
const localEnvironmentFile = resolve(projectRoot, ".env.local.deploy");
const productionEnvironmentFile = resolve(projectRoot, ".env");
const supportedCommands = new Set(["up", "down", "restart", "logs", "ps", "config"]);

function readDeploymentTarget() {
  const match = readFileSync(targetFile, "utf8").match(/^DEPLOY_TARGET=(local|production)$/m);
  if (!match) {
    throw new Error("deployment.env must contain exactly DEPLOY_TARGET=local or DEPLOY_TARGET=production.");
  }
  return match[1];
}

async function ensureLocalEnvironment() {
  if (existsSync(localEnvironmentFile)) {
    const current = readFileSync(localEnvironmentFile, "utf8");
    const normalized = current.replace(
      /^ADMIN_PASSWORD_HASH=(?!')(.+)$/m,
      (_, hash) => `ADMIN_PASSWORD_HASH='${hash}'`,
    );

    if (normalized !== current) {
      writeFileSync(localEnvironmentFile, normalized, { mode: 0o600 });
      console.log("Updated the local password hash to Docker Compose's literal format.");
    }
    return;
  }

  const databasePassword = randomBytes(24).toString("base64url");
  const adminPassword = randomBytes(12).toString("base64url");
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const authSecret = randomBytes(32).toString("base64url");
  const databaseUrl = `postgresql://postgres:${encodeURIComponent(databasePassword)}@postgres:5432/portfolio`;

  writeFileSync(
    localEnvironmentFile,
    [
      "# Generated local deployment credentials. This file is gitignored.",
      "POSTGRES_USER=postgres",
      `POSTGRES_PASSWORD=${databasePassword}`,
      "POSTGRES_DB=portfolio",
      `DATABASE_URL=${databaseUrl}`,
      "ADMIN_EMAIL=admin@local.test",
      `ADMIN_PASSWORD_HASH='${adminPasswordHash}'`,
      `LOCAL_ADMIN_PASSWORD=${adminPassword}`,
      `NEXTAUTH_SECRET=${authSecret}`,
      `AUTH_SECRET=${authSecret}`,
      "NEXTAUTH_URL=http://localhost:3000",
      "RESEND_API_KEY=",
      "CONTACT_TO_EMAIL=javier.raut@gmail.com",
      "CONTACT_FROM_EMAIL=Portfolio <local@localhost>",
      "",
    ].join("\n"),
    { mode: 0o600 },
  );

  console.log("Created .env.local.deploy with local-only credentials.");
}

function assertDockerDaemon() {
  const docker = spawnSync("docker", ["--version"], { stdio: "ignore" });
  if (docker.error?.code === "ENOENT") {
    throw new Error("Docker is not installed or is not available in PATH. Install Docker, then run this command again.");
  }

  const daemon = spawnSync("docker", ["info"], { stdio: "ignore" });
  if (daemon.status === 0) return;

  const startInstruction =
    process.platform === "linux"
      ? "Start it with: sudo systemctl enable --now docker"
      : "Start Docker Desktop, wait until it reports that Docker is running, then retry.";

  throw new Error(`The Docker daemon is not running.\n${startInstruction}`);
}

function printLocalAccess() {
  const contents = readFileSync(localEnvironmentFile, "utf8");
  const email = contents.match(/^ADMIN_EMAIL=(.+)$/m)?.[1];
  const password = contents.match(/^LOCAL_ADMIN_PASSWORD=(.+)$/m)?.[1];

  console.log("\nLocal portfolio: http://localhost:3000");
  console.log("LAN access:       http://<your-device-ip>:3000");
  console.log("Admin dashboard:  http://localhost:3000/admin");
  console.log(`Admin login:      ${email} / ${password}\n`);
}

function composeArguments(command, composeFile, environmentFile) {
  const base = ["compose", "--env-file", environmentFile, "-f", composeFile];
  if (command === "up") return [...base, "up", "-d", "--build"];
  if (command === "down") return [...base, "down", "--remove-orphans"];
  if (command === "restart") return [...base, "restart"];
  if (command === "logs") return [...base, "logs", "-f", "web"];
  if (command === "config") return [...base, "config", "--quiet"];
  return [...base, command];
}

async function main() {
  const command = process.argv[2] ?? "up";
  if (!supportedCommands.has(command)) {
    throw new Error(`Unsupported deployment command: ${command}`);
  }

  const target = readDeploymentTarget();
  const isLocal = target === "local";
  const composeFile = resolve(projectRoot, isLocal ? "docker-compose.local.yml" : "docker-compose.yml");
  const environmentFile = isLocal ? localEnvironmentFile : productionEnvironmentFile;

  if (isLocal) await ensureLocalEnvironment();
  else if (!existsSync(environmentFile)) {
    throw new Error("Production deployment requires a configured .env file.");
  }

  if (command !== "config") assertDockerDaemon();

  console.log(`Deployment target: ${target}`);
  const result = spawnSync("docker", composeArguments(command, composeFile, environmentFile), {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  if (isLocal && command === "up") printLocalAccess();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
