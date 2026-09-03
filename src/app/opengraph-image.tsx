import { ImageResponse } from "next/og";

export const alt = "Javier Raut — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f2efe8",
          color: "#171713",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 24,
            fontWeight: 600,
            justifyContent: "space-between",
            letterSpacing: "-0.02em",
          }}
        >
          <span>Javier Raut</span>
          <span style={{ color: "#806c4f" }}>portfolio.jmraut.dev</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              color: "#806c4f",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Software Engineer
          </span>
          <span
            style={{
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: "-0.055em",
              lineHeight: 1.02,
              maxWidth: 920,
            }}
          >
            Dependable systems for real work.
          </span>
        </div>
        <div
          style={{
            borderTop: "2px solid #c9c1b5",
            display: "flex",
            fontSize: 22,
            justifyContent: "space-between",
            paddingTop: 24,
          }}
        >
          <span>Products · Data · Infrastructure</span>
          <span>Philippines</span>
        </div>
      </div>
    ),
    size,
  );
}
