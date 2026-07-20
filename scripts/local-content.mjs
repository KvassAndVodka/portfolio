import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const projectRoot = resolve(import.meta.dirname, "..");
const targetFile = resolve(projectRoot, "deployment.env");
const environmentFile = resolve(projectRoot, ".env.local.deploy");
const command = process.argv[2] ?? "seed";

const placeholderPosts = [
  {
    slug: "local-demo-legislative-records-tracker",
    title: "Legislative Records Tracker",
    summary: "A searchable internal workspace for organizing measures, committee activity, and document history.",
    content: `## The problem

Legislative work produces a constant stream of documents, status changes, and handoffs. This prototype brings those moving parts into one searchable workspace.

## What I focused on

- Fast lookup across measures and committee records
- Clear ownership and status history
- A compact interface that still works on older office hardware
- Audit-friendly changes without exposing sensitive material

## Local demo note

This is placeholder content for testing the portfolio layout and admin workflow.`,
    type: "PROJECT",
    category: "Government Technology",
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
    isPinned: true,
    pinnedOrder: 1,
    publishedAt: "2026-06-18T08:00:00.000Z",
  },
  {
    slug: "local-demo-constituent-request-workflow",
    title: "Constituent Request Workflow",
    summary: "A service-request prototype that keeps intake, assignment, follow-ups, and resolution in one understandable flow.",
    content: `## Why I built it

Request tracking breaks down when context is scattered across inboxes and spreadsheets. This concept explores a calmer, more accountable workflow.

## Design decisions

- Plain-language statuses for non-technical staff
- Visible next actions instead of dense dashboards
- Responsive forms for field and office use
- Minimal collection of personal information

This entry is temporary local demo content.`,
    type: "PROJECT",
    category: "Public Service",
    techStack: ["React", "Node.js", "PostgreSQL", "Tailscale"],
    isPinned: true,
    pinnedOrder: 2,
    publishedAt: "2026-05-27T08:00:00.000Z",
  },
  {
    slug: "local-demo-homelab-operations-console",
    title: "Homelab Operations Console",
    summary: "A small operations console for checking services, containers, backups, and private-network health at a glance.",
    content: `## A practical systems playground

My homelab is where I test deployment patterns before they reach real projects. This console turns scattered operational signals into a single useful view.

## Included in the prototype

- Container and host health summaries
- Backup recency checks
- Private service links over Tailscale
- Mobile-friendly incident notes

This entry is temporary local demo content.`,
    type: "PROJECT",
    category: "Infrastructure",
    techStack: ["Linux", "Docker", "Proxmox", "Tailscale"],
    isPinned: true,
    pinnedOrder: 3,
    publishedAt: "2026-04-12T08:00:00.000Z",
  },
  {
    slug: "local-demo-accessible-component-library",
    title: "Accessible Component Library",
    summary: "Reusable interface primitives built around keyboard access, readable states, and consistent light and dark themes.",
    content: `## More than matching screenshots

This library treats accessibility states, validation, theming, and responsive behavior as part of the component contract.

## Principles

- Semantic HTML first
- Visible focus and error states
- Tokens shared by light and dark themes
- Motion that respects reduced-motion preferences

This entry is temporary local demo content.`,
    type: "PROJECT",
    category: "Frontend Systems",
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    isPinned: false,
    pinnedOrder: null,
    publishedAt: "2026-03-08T08:00:00.000Z",
  },
  {
    slug: "local-demo-shipping-tools-under-real-constraints",
    title: "Shipping Internal Tools Under Real Constraints",
    summary: "What changes when software has to fit real workflows, uneven hardware, and people who cannot pause their day to learn it.",
    content: `Good internal software is rarely about adding the most features. It is about understanding where attention is already being spent.

## Start with the handoff

The most revealing part of a workflow is often the moment responsibility moves from one person to another. That is where missing context becomes rework.

## Design for interruption

Office tools should make it obvious where someone left off. Drafts, status history, and a clear next action matter more than decorative dashboards.

## Keep the system explainable

If the team cannot describe what a status means, the interface is encoding ambiguity rather than removing it.

_Temporary local demo article._`,
    type: "BLOG",
    category: "Engineering",
    techStack: [],
    isPinned: false,
    pinnedOrder: null,
    publishedAt: "2026-06-02T08:00:00.000Z",
  },
  {
    slug: "local-demo-what-self-hosting-taught-me",
    title: "What Self-Hosting Taught Me About Reliability",
    summary: "A homelab makes infrastructure lessons immediate: backups need restores, observability needs action, and simple systems usually recover faster.",
    content: `Self-hosting turns abstract infrastructure advice into very practical consequences.

## A backup is only a theory until it restores

Scheduled jobs and green checkmarks are not enough. A restore test proves that the data, credentials, and recovery steps still work together.

## Alerts need an owner and an action

More telemetry can create less clarity. I now prefer a small set of signals tied to specific decisions.

## Boring is a feature

The system I can understand while tired is usually the system I can recover.

_Temporary local demo article._`,
    type: "BLOG",
    category: "Homelab",
    techStack: [],
    isPinned: false,
    pinnedOrder: null,
    publishedAt: "2026-05-10T08:00:00.000Z",
  },
  {
    slug: "local-demo-portfolio-as-conversation",
    title: "A Portfolio Should Feel Like a Conversation",
    summary: "A portfolio works better when it introduces a person, explains their judgment, and gives the reader an easy way into the work.",
    content: `A project grid can prove that work exists, but it cannot introduce the person behind it on its own.

## Give the reader a point of view

The useful question is not only “What did you build?” It is also “What did you notice, prioritize, and learn?”

## Make scanning rewarding

Recruiters need recognizable tools and outcomes quickly. Deeper context should be available without making the first pass feel like homework.

## End with an invitation

The contact section should feel like a natural continuation of the introduction, not a generic lead-generation form.

_Temporary local demo article._`,
    type: "BLOG",
    category: "Design",
    techStack: [],
    isPinned: false,
    pinnedOrder: null,
    publishedAt: "2026-04-21T08:00:00.000Z",
  },
];

function assertLocalTarget() {
  const target = readFileSync(targetFile, "utf8").trim();
  if (target !== "DEPLOY_TARGET=local") {
    throw new Error("Local placeholder content is blocked unless deployment.env is exactly DEPLOY_TARGET=local.");
  }
}

function readLocalDatabaseUrl() {
  const contents = readFileSync(environmentFile, "utf8");
  const value = contents.match(/^DATABASE_URL=(.+)$/m)?.[1];
  if (!value) throw new Error("DATABASE_URL is missing from .env.local.deploy. Run npm run deploy:up first.");

  const url = new URL(value.replace(/^['"]|['"]$/g, ""));
  url.hostname = "127.0.0.1";
  return url.toString();
}

async function seed(client) {
  let inserted = 0;

  for (const post of placeholderPosts) {
    const result = await client.query(
      `INSERT INTO "Post" (
        "id", "slug", "title", "summary", "content", "publishedAt", "updatedAt",
        "type", "category", "isPinned", "pinnedOrder", "showAsBlog", "techStack"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), $7::"PostType", $8, $9, $10, false, $11
      ) ON CONFLICT ("slug") DO NOTHING`,
      [
        `local-placeholder-${post.slug}`,
        post.slug,
        post.title,
        post.summary,
        post.content,
        post.publishedAt,
        post.type,
        post.category,
        post.isPinned,
        post.pinnedOrder,
        post.techStack,
      ],
    );
    inserted += result.rowCount ?? 0;
  }

  console.log(`Local placeholders ready: ${inserted} added, ${placeholderPosts.length - inserted} already present.`);
}

async function clear(client) {
  const result = await client.query(`DELETE FROM "Post" WHERE "slug" LIKE 'local-demo-%'`);
  console.log(`Removed ${result.rowCount ?? 0} local placeholder posts.`);
}

async function main() {
  assertLocalTarget();
  if (!new Set(["seed", "clear"]).has(command)) {
    throw new Error(`Unsupported local content command: ${command}`);
  }

  const client = new pg.Client({ connectionString: readLocalDatabaseUrl() });
  await client.connect();
  try {
    if (command === "seed") await seed(client);
    else await clear(client);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
