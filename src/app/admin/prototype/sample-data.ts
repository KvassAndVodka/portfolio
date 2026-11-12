// PROTOTYPE: sample data for the admin redesign mockup. Delete with the prototype.

export type Status = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export const pages = ["dashboard", "notes", "write", "projects", "media", "trash", "settings"] as const;
export type PageKey = (typeof pages)[number];

export const pageLabels: Record<PageKey, string> = {
  dashboard: "Home",
  notes: "Notes",
  write: "Write",
  projects: "Projects",
  media: "Media",
  trash: "Trash",
  settings: "Settings",
};

export const stats = { views: 4821, viewsChange: 12, visitors: 1730, visitorsChange: -4, contacts: 9 };

export const dailyVisits = [120, 98, 143, 160, 151, 172, 133, 190, 211, 184, 176, 230, 205, 248];

export const topPages = [
  { path: "/", views: 1840 },
  { path: "/projects/cloud-field", views: 712 },
  { path: "/notes/shipping-a-map-with-deckgl", views: 530 },
  { path: "/notes/week-44", views: 318 },
  { path: "/projects/portfolio-v3", views: 251 },
];

export const countries = [
  { name: "Philippines", share: 38 },
  { name: "United States", share: 21 },
  { name: "Germany", share: 9 },
  { name: "Japan", share: 7 },
];

export const notes: Array<{ title: string; summary: string; status: Status; category: string; minutes: number; edited: string; fromPipeline?: boolean; cover?: string; sent?: string }> = [
  { title: "Week 46: the drafts endpoint, finally", summary: "Wiring Obsidian notes through an MCP server into a review queue.", status: "DRAFT", category: "Weekly", minutes: 4, edited: "2 hours ago", fromPipeline: true },
  { title: "Week 45: maps, clouds and frame budgets", summary: "What it took to keep the story map at 60 fps on a laptop.", status: "DRAFT", category: "Weekly", minutes: 6, edited: "yesterday", fromPipeline: true },
  { title: "Shipping a map with deck.gl", summary: "MapLibre, deck.gl layers and the theming trick that made dark mode cheap.", status: "PUBLISHED", category: "Engineering", minutes: 9, edited: "3 days ago", cover: "#ff5a24", sent: "08 NOV" },
  { title: "Why I stopped using a CMS", summary: "Prisma, a markdown editor and one admin panel are enough.", status: "SCHEDULED", category: "Essay", minutes: 5, edited: "last week", cover: "#22643a", sent: "14 NOV" },
  { title: "Notes on reduced motion", summary: "Respecting the setting without making the site feel dead.", status: "PUBLISHED", category: "Design", minutes: 3, edited: "2 weeks ago", cover: "#815600", sent: "29 OCT" },
];

export const projects = [
  { title: "Cloud Field", category: "Creative coding", tech: ["deck.gl", "MapLibre", "GSAP"], status: "PUBLISHED" as Status, pinned: true, health: "" },
  { title: "Portfolio v3", category: "Web", tech: ["Next.js", "Prisma", "Tailwind"], status: "PUBLISHED" as Status, pinned: true, health: "" },
  { title: "Drafts MCP server", category: "Tooling", tech: ["MCP", "Node"], status: "DRAFT" as Status, pinned: false, health: "No thumbnail" },
  { title: "Visitor map", category: "Data viz", tech: ["d3-geo", "TopoJSON"], status: "PUBLISHED" as Status, pinned: false, health: "No links" },
];

export const media = [
  { name: "cloud-field-hero.webp", size: "412 KB", tint: "#ff5a24" },
  { name: "map-dark.png", size: "1.2 MB", tint: "#303036" },
  { name: "week-45-frame.png", size: "640 KB", tint: "#22643a" },
  { name: "avatar.jpg", size: "88 KB", tint: "#815600" },
  { name: "deckgl-layers.svg", size: "24 KB", tint: "#a92713" },
  { name: "portfolio-v3.webp", size: "530 KB", tint: "#5f5d57" },
];

export const trash = [
  { title: "Untitled draft", type: "Note", deleted: "3 days ago", purge: "in 27 days" },
  { title: "Old about page", type: "Project", deleted: "2 weeks ago", purge: "in 16 days" },
];

export const draftBody = [
  "This week the drafts endpoint went live. Every Sunday a script reads my Obsidian vault and the week's git log, asks a local model for a summary, and posts it to the admin as a draft.",
  "Nothing publishes on its own. The point is that I open the admin on Monday and the hardest part, the blank page, is already gone.",
  "The interesting bit was the token check. The endpoint only accepts drafts, caps the body size, and refuses anything that tries to set a status.",
];

export const visitorCountries = [
  { countryCode: "PH", views: 1830, visitors: 660 },
  { countryCode: "US", views: 1010, visitors: 363 },
  { countryCode: "DE", views: 430, visitors: 156 },
  { countryCode: "JP", views: 340, visitors: 121 },
  { countryCode: "SG", views: 210, visitors: 88 },
  { countryCode: "GB", views: 180, visitors: 70 },
];
