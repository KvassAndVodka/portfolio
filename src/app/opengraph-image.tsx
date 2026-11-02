import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Javier Raut";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Light theme tokens from globals.css.
const background = "#f8f8f5";
const foreground = "#161616";
const accent = "#c63c12";

const fonts = join(process.cwd(), "node_modules/geist/dist/fonts");

// GIS nods, all faint: contour rings around a survey mark, a scale bar, a north arrow, crop marks.
const peak = { x: 1010, y: 300 };

/** A point on contour `level`: a ring whose radius wobbles with a few fixed harmonics, like a hill's outline. */
function contourPoint(level: number, angle: number) {
  const wobble =
    1 + 0.14 * Math.sin(angle * 2 + level * 0.35) + 0.07 * Math.sin(angle * 3 - level * 0.6) + 0.04 * Math.sin(angle * 5 + level);
  const radius = (34 + level * 38) * wobble;
  return { x: peak.x + Math.cos(angle) * radius * 1.35, y: peak.y + Math.sin(angle) * radius };
}

function contour(level: number) {
  const points = Array.from({ length: 72 }, (_, step) => contourPoint(level, (step / 72) * Math.PI * 2));
  return `M${points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
}

// Elevation labels, 50 m a ring, placed where the title and data strip leave room.
const elevations = [
  { label: "500", ...contourPoint(2, 0.6) },
  { label: "400", ...contourPoint(4, -2.2) },
];

// A dashed track leaving the survey mark, a nod to the story's journey between places.
const route = { from: peak, to: { x: 770, y: 470 } };

const corners = [
  [40, 32],
  [1160, 32],
  [40, 598],
  [1160, 598],
];

// Set like the story's map plate: hard rules, a slab title, and a mono data strip.
export default async function OpenGraphImage() {
  const [black, mono] = await Promise.all([
    readFile(join(fonts, "geist-sans/Geist-Black.ttf")),
    readFile(join(fonts, "geist-mono/GeistMono-SemiBold.ttf")),
  ]);
  const cells = [
    ["Focus", "Products · Data · Infra"],
    ["Region", "N. Mindanao, PH"],
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
        <svg
          width={1200}
          height={630}
          viewBox="0 0 1200 630"
          style={{ left: 0, position: "absolute", top: 0 }}
        >
          {Array.from({ length: 10 }, (_, level) => (
            <path
              key={level}
              d={contour(level)}
              fill="none"
              stroke={foreground}
              strokeOpacity={level % 5 === 4 ? 0.16 : 0.08}
              strokeWidth={level % 5 === 4 ? 2 : 1.25}
            />
          ))}
          <path
            d={`M${route.from.x} ${route.from.y}C${route.from.x - 70} ${route.from.y + 150} ${route.to.x + 110} ${route.to.y - 140} ${route.to.x} ${route.to.y}`}
            fill="none"
            stroke={accent}
            strokeDasharray="7 6"
            strokeWidth={2.5}
          />
          <circle cx={route.to.x} cy={route.to.y} r={7} fill={background} stroke={accent} strokeWidth={2.5} />
          {Array.from({ length: 23 }, (_, tick) => (
            <path key={tick} d={`M${72 + tick * 48} 64V${tick % 4 ? 70 : 74}`} stroke={foreground} strokeWidth={1.5} />
          ))}
          <path
            d={`M${peak.x - 9} ${peak.y}H${peak.x + 9}M${peak.x} ${peak.y - 9}V${peak.y + 9}`}
            stroke={accent}
            strokeWidth={2.5}
          />
          {corners.map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 8} ${y}H${x + 8}M${x} ${y - 8}V${y + 8}`} stroke={foreground} strokeOpacity={0.35} strokeWidth={1.5} />
          ))}
        </svg>
        {elevations.map(({ label, x, y }) => (
          <span
            key={label}
            style={{
              background,
              fontFamily: "Geist Mono",
              fontSize: 13,
              left: x - 16,
              opacity: 0.55,
              padding: "0 4px",
              position: "absolute",
              top: y - 9,
            }}
          >
            {label}
          </span>
        ))}
        <span
          style={{
            color: accent,
            fontFamily: "Geist Mono",
            fontSize: 13,
            left: peak.x + 16,
            letterSpacing: 1.5,
            position: "absolute",
            top: peak.y - 26,
          }}
        >
          BM 01
        </span>
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
            fontSize: 200,
            letterSpacing: -12,
            lineHeight: 0.84,
            margin: "30px 0 0",
            textTransform: "uppercase",
          }}
        >
          <span>Javier</span>
          <span style={{ alignItems: "flex-end", display: "flex" }}>
            Raut
            <span style={{ background: accent, height: 36, marginBottom: 16, marginLeft: 24, width: 36 }} />
          </span>
        </div>
        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 14,
            gap: 28,
            justifyContent: "flex-end",
            letterSpacing: 1.5,
            margin: "auto 0 14px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: 172 }}>
              <span>0</span>
              <span>1</span>
              <span>2 KM</span>
            </div>
            <div style={{ border: `2px solid ${foreground}`, display: "flex", height: 10, width: 160 }}>
              {[0, 1, 2, 3].map((segment) => (
                <div key={segment} style={{ background: segment % 2 ? background : foreground, flex: 1 }} />
              ))}
            </div>
          </div>
          <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 2 }}>
            <span>N</span>
            <svg width={18} height={26} viewBox="0 0 18 26">
              <path d="M9 0L18 26L9 19L0 26Z" fill={foreground} />
            </svg>
          </div>
        </div>
        <div style={{ borderTop: `3px solid ${foreground}`, display: "flex" }}>
          {cells.map(([label, value], index) => (
            <div
              key={label}
              style={{
                borderLeft: index ? `3px solid ${foreground}` : "none",
                display: "flex",
                flex: 1,
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
