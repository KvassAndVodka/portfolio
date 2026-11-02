import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Javier Raut — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Light theme tokens from globals.css.
const background = "#f8f8f5";
const foreground = "#161616";
const accent = "#c63c12";

const fonts = join(process.cwd(), "node_modules/geist/dist/fonts");

// Set like the story's map plate: hard rules, a slab title, and a mono data strip.
export default async function OpenGraphImage() {
  const [black, mono] = await Promise.all([
    readFile(join(fonts, "geist-sans/Geist-Black.ttf")),
    readFile(join(fonts, "geist-mono/GeistMono-SemiBold.ttf")),
  ]);
  const cells = [
    ["Name", "Javier Raut"],
    ["Focus", "Products · Data · Infra"],
    ["Base", "Philippines"],
    ["Site", "portfolio.jmraut.dev"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background,
          color: foreground,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "64px 72px 56px",
          position: "relative",
          width: "100%",
        }}
      >
        <div style={{ background: accent, height: 8, left: 0, position: "absolute", top: 0, width: 260 }} />
        <div
          style={{
            borderTop: `3px solid ${foreground}`,
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 20,
            justifyContent: "space-between",
            letterSpacing: 2.4,
            paddingTop: 14,
            textTransform: "uppercase",
          }}
        >
          <span>Fig. 00 — Portfolio</span>
          <span>N 08°29′ E 124°41′</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Geist",
            fontSize: 168,
            letterSpacing: -10,
            lineHeight: 0.84,
            margin: "30px 0 0",
            textTransform: "uppercase",
          }}
        >
          <span>Software</span>
          <span style={{ alignItems: "flex-end", display: "flex" }}>
            Engineer
            <span style={{ background: accent, height: 30, marginBottom: 14, marginLeft: 22, width: 30 }} />
          </span>
        </div>
        <div style={{ borderTop: `3px solid ${foreground}`, display: "flex", marginTop: "auto" }}>
          {cells.map(([label, value], index) => (
            <div
              key={label}
              style={{
                borderLeft: index ? `3px solid ${foreground}` : "none",
                display: "flex",
                flex: [0.9, 1.6, 0.9, 1.4][index],
                flexDirection: "column",
                fontFamily: "Geist Mono",
                gap: 6,
                padding: index ? "14px 0 0 18px" : "14px 0 0",
              }}
            >
              <span style={{ fontSize: 16, letterSpacing: 2, opacity: 0.6, textTransform: "uppercase" }}>{label}</span>
              <span style={{ fontSize: 22, whiteSpace: "nowrap" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: black, weight: 900 },
        { name: "Geist Mono", data: mono, weight: 600 },
      ],
    },
  );
}
