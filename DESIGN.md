---
name: "Javier Raut Portfolio"
description: "An expressive, proof-led engineering portfolio where interactive systems, inspectable projects, verified experience, and technical writing reinforce one another."
colors:
  accent: "#FF7440"
  accent-strong-light: "#E95724"
  accent-strong-dark: "#FF8A60"
  accent-ink: "#250B02"
  light-bg: "#F7F7F5"
  light-fg: "#191918"
  light-surface: "#FFFFFF"
  light-surface-subtle: "#F1F0EF"
  light-muted: "#625D59"
  light-line: "#D8D4D1"
  light-success: "#17643F"
  dark-bg: "#121211"
  dark-fg: "#F2F2EF"
  dark-surface: "#13110F"
  dark-surface-subtle: "#1B1816"
  dark-muted: "#B8B1AC"
  dark-line: "#332E2A"
  dark-success: "#73D6A6"
  portrait-bg: "#030201"
  footer-line: "#27221F"
  footer-bg: "#080706"
  footer-muted: "#9B948F"
typography:
  families:
    sans: "var(--font-geist-sans), sans-serif"
    mono: "var(--font-geist-mono), monospace"
  scale:
    icon-micro: "0.58rem"
    caption: "0.625rem"
    label: "0.6875rem"
    small: "0.75rem"
    compact: "0.8125rem"
    body-small: "0.875rem"
    body: "0.9375rem"
    body-large: "1.0625rem"
    display: "clamp(3.2rem, 6.2vw, 5.8rem)"
  display:
    fontWeight: 620
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  body:
    fontWeight: 400
    lineHeight: 1.7
    maxWidth: "65ch"
rounded:
  xs: "0.25rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "clamp(5.5rem, 10vw, 8rem)"
---

# Design System: Living Systems Portfolio

## Creative direction

The design evolves the original live portfolio without sanding away its personality. It should feel like a precise personal site made by an engineer who enjoys making systems move: reactive geometry, one decisive orange, direct language, and concrete proof of work.

Three voice words: **kinetic, capable, assured**.

The first viewport must answer what role Javier fits, what kind of systems he builds, and where to inspect the work. The portrait establishes identity; the project evidence establishes hireability.

## Identity to preserve

- Stone light and near-black dark themes with the same bright orange accent.
- Geist Sans for interface and narrative copy; Geist Mono only for dates and technical metadata.
- Formal portrait in a restrained rectangular frame.
- The original reactive grid, including cursor response, expanding pulses, and collision burn-out.
- Direct links to selected projects and GitHub in the first viewport.
- Direct sections for background, technical practice, selected projects, and contact.

## Polish principles

- Do not use generated lifestyle imagery as a substitute for project evidence.
- Cards use a border or a shadow, never both. Current project cards use a border only.
- Card radii stop at `1rem`; the hero panel is the largest surface radius.
- Timeline entries are open rows rather than identical nested cards.
- Technologies are structured lists, not a wall of pills, and source or live links stay visible on project cards.
- Category styling remains neutral and consistent rather than assigning arbitrary colors.
- The interactive canvas is the signature visual. Do not imitate it with decorative CSS grids elsewhere.
- Avoid generic glow effects, repeated status dots, and fake operational metrics.

## Motion and performance

- Content is visible before JavaScript runs. Motion enhances hierarchy instead of unlocking content.
- Hero typography, the portrait, and the canvas enter as one rehearsed sequence.
- Project and experience motion uses stagger, clipping, and directional movement rather than repeating one fade-up.
- The animated field pauses in background tabs, caps device-pixel ratio, and becomes a static grid under reduced motion.

## Accessibility

- Body and muted text meet WCAG AA contrast in both themes.
- Button and link colors meet WCAG AA contrast in both themes.
- The mobile menu exposes its expanded state, closes with Escape, and prevents background scrolling.
- Focus indicators use a two-pixel orange outline with a four-pixel offset.
