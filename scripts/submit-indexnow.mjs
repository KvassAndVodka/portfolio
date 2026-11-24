import "dotenv/config";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

const args = process.argv.slice(2);
const optional = args.includes("--optional");
const explicitUrls = args.filter((arg) => arg !== "--optional");

const key = process.env.INDEXNOW_KEY?.trim() ?? "";
if (!INDEXNOW_KEY_PATTERN.test(key)) {
  if (optional) {
    console.log("INDEXNOW_KEY is not set; skipping IndexNow submission.");
    process.exit(0);
  }
  console.error("INDEXNOW_KEY must be 8-128 alphanumeric or hyphen characters.");
  process.exit(1);
}

const origin = new URL(process.env.SITE_URL?.trim() || "https://portfolio.jmraut.dev");
const keyLocation = new URL("/indexnow-key.txt", origin).toString();

async function fetchSitemapUrls() {
  const sitemapUrl = new URL("/sitemap.xml", origin).toString();
  const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sitemapUrl}: HTTP ${response.status}`);
  }
  const xml = await response.text();
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((match) => match[1].trim()).filter(Boolean);
}

async function main() {
  const rawUrls = explicitUrls.length > 0 ? explicitUrls : await fetchSitemapUrls();
  const urlList = [
    ...new Set(
      rawUrls
        .map((raw) => {
          try {
            const resolved = new URL(raw, origin);
            return resolved.host === origin.host ? resolved.toString() : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean),
    ),
  ];

  if (urlList.length === 0) {
    console.log("No URLs found to submit to IndexNow.");
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: origin.host,
      key,
      keyLocation,
      urlList,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (response.status === 200 || response.status === 202) {
    console.log(`IndexNow accepted ${urlList.length} URL(s) (HTTP ${response.status}).`);
    return;
  }

  const body = await response.text().catch(() => "");
  throw new Error(`IndexNow rejected submission with HTTP ${response.status}: ${body.trim()}`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
