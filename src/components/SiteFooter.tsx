import Link from "next/link";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa6";

import FooterWordmark from "@/components/FooterWordmark";
import LocalTime from "@/components/LocalTime";
import { contourLevels, heightAt } from "@/lib/contours";
import { siteConfig } from "@/lib/seo";

// The footer's terrain: the summit in the open middle of the strip (clear of the text on both sides), a
// ridge running off to the right behind the links, and a lower hill to the left.
const FOOTER_HILLS = [
  { x: 760, y: 210, height: 540, spread: 150, stretch: 1.4 },
  { x: 1120, y: 300, height: 300, spread: 120, stretch: 1.8 },
  { x: 318, y: 520, height: 260, spread: 140, stretch: 1.2 },
  { x: 640, y: 120, height: 180, spread: 90 },
];
const FOOTER_TERRAIN = contourLevels(FOOTER_HILLS, { width: 1440, height: 640, step: 25 });
const SUMMIT = Math.round(heightAt(FOOTER_HILLS, 760, 210));

/** The last stop on every public page: a dark legend strip with the map's details and a wordmark that rises in. */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <svg className="site-footer-contours" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {FOOTER_TERRAIN.map((level) => (
          <path className={level.index ? "is-index" : undefined} d={level.d} key={level.elevation} />
        ))}
        {FOOTER_TERRAIN.filter((level) => level.label).map(({ elevation, label }) => (
          <text className="site-footer-elevation" key={elevation} x={label!.x} y={label!.y}>
            {elevation} m
          </text>
        ))}
        <path className="site-footer-route" d="M318 468C400 420 470 452 560 392S680 300 760 210" />
        <circle className="site-footer-pin" cx="318" cy="468" r="5" />
        <circle className="site-footer-pin" cx="760" cy="210" r="5" />
        <text className="site-footer-spot" x="776" y="186">
          ▲ {SUMMIT} m
        </text>
      </svg>
      <div className="site-shell">
        <div className="site-footer-top">
          <p className="site-footer-place">
            <span>N 08°29′ · E 124°41′</span>
            <span>
              Cagayan de Oro, Philippines · <LocalTime />
            </span>
          </p>
          <nav className="site-footer-links" aria-label="Footer">
            <div>
              <h2>Pages</h2>
              <Link href="/">Home</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/notes">Notes</Link>
              <Link href="/#contact">Contact</Link>
              <a href="/resume.pdf" rel="noreferrer" target="_blank">
                Resume<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <div>
              <h2>Elsewhere</h2>
              <a href={siteConfig.github} rel="noreferrer" target="_blank">
                <FaGithub aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={siteConfig.linkedin} rel="noreferrer" target="_blank">
                <FaLinkedin aria-hidden="true" /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={siteConfig.email}>
                <FaEnvelope aria-hidden="true" /> Email
              </a>
            </div>
          </nav>
        </div>

        <p className="site-footer-bottom">
          <span>© 2026 Javier Raut</span>
          <span>Built with Next.js, MapLibre and GSAP</span>
        </p>

        <FooterWordmark />
      </div>
    </footer>
  );
}
