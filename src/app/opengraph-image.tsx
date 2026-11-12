import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { contourLevels } from "@/lib/contours";

export const alt = "Javier Raut, Software Engineer in Cagayan de Oro, Philippines";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The hero postcard's palette (see DESIGN.md).
const page = "#f3ede2";
const paper = "#fff8ed";
const ink = "#161616";
const inkSoft = "#3d3c38";
const orange = "#ff5a24";
const rust = "#a3300e";

const fonts = join(process.cwd(), "node_modules/geist/dist/fonts");

// The orange panel's contours, traced from one hill behind the portrait, as on the site.
const panel = { width: 470, height: 484 };
const contours = contourLevels([{ x: 150, y: 250, height: 260, spread: 120, stretch: 1.25 }], {
  ...panel,
  step: 26,
});

// The hero postcard, set as a link preview: portrait on the orange panel, the message and stamp beside it.
export default async function OpenGraphImage() {
  const [black, sans, mono, portrait] = await Promise.all([
    readFile(join(fonts, "geist-sans/Geist-Black.ttf")),
    readFile(join(fonts, "geist-sans/Geist-Medium.ttf")),
    readFile(join(fonts, "geist-mono/GeistMono-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/portrait-cutout.png")),
  ]);
  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ background: page, display: "flex", height: "100%", padding: "55px 60px", width: "100%" }}>
        <div
          style={{
            background: paper,
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.35)",
            display: "flex",
            height: "100%",
            padding: 18,
            width: "100%",
          }}
        >
          {/* The orange panel; the portrait rises above the card's top edge, as on the site. */}
          <div style={{ background: orange, display: "flex", height: panel.height, position: "relative", width: panel.width }}>
            <svg aria-hidden="true" width={panel.width} height={panel.height} style={{ left: 0, position: "absolute", top: 0 }}>
              {contours.map((level) => (
                <path
                  d={level.d}
                  fill="none"
                  key={level.elevation}
                  stroke={ink}
                  strokeOpacity={0.3}
                  strokeWidth={level.index ? 2 : 1.2}
                />
              ))}
            </svg>
            <img src={portraitSrc} alt="" height={540} width={330} style={{ bottom: 0, left: 104, position: "absolute" }} />
            <span style={{ fontFamily: "Geist", fontSize: 26, left: 24, position: "absolute", top: 20 }}>Portfolio</span>
            <span style={{ fontFamily: "Geist Mono", fontSize: 14, left: 24, letterSpacing: 1.5, position: "absolute", top: 56 }}>
              N 08°29′ E 124°41′
            </span>
          </div>

          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", paddingLeft: 56, position: "relative" }}>
            {/* The CDO stamp, without the perforation (next/og can't draw it): a framed orange tile, tilted. */}
            <div
              style={{
                background: orange,
                border: "6px solid white",
                boxShadow: `inset 0 0 0 3px ${orange}, inset 0 0 0 4.5px ${ink}`,
                display: "flex",
                flexDirection: "column",
                fontFamily: "Geist Mono",
                height: 128,
                justifyContent: "space-between",
                padding: "14px 14px 10px",
                position: "absolute",
                right: 0,
                top: -6,
                transform: "rotate(4deg)",
                width: 104,
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: 1 }}>PILIPINAS</span>
              <span style={{ fontSize: 30, letterSpacing: -1 }}>CDO</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Geist Black", fontSize: 100, letterSpacing: -5, lineHeight: 0.86 }}>
              <span>JAVIER</span>
              <span style={{ display: "flex" }}>
                RAUT<span style={{ color: orange }}>.</span>
              </span>
            </div>
            <span style={{ color: inkSoft, fontFamily: "Geist", fontSize: 25, marginTop: 26 }}>Software Engineer</span>
            <span style={{ color: ink, fontFamily: "Geist", fontSize: 25, marginTop: 4 }}>Cagayan de Oro, Philippines</span>
            <span style={{ color: rust, fontFamily: "Geist Mono", fontSize: 18, letterSpacing: 2, marginTop: 30 }}>
              SOFTWARE · GIS · INFRASTRUCTURE
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Black", data: black, weight: 900 },
        { name: "Geist", data: sans, weight: 500 },
        { name: "Geist Mono", data: mono, weight: 600 },
      ],
    },
  );
}
