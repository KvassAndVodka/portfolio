---
name: "Javier Raut Portfolio"
description: "An expressive, proof-led engineering portfolio where interactive systems, inspectable projects, verified experience, and technical writing reinforce one another."
colors:
  accent-light: "#C63C12"
  accent-dark: "#FF7342"
  accent-fill: "#FF5A24"
  accent-hover-light: "#9F2C0B"
  accent-hover-dark: "#FF926D"
  accent-ink-light: "#FFFFFF"
  accent-ink-dark: "#161616"
  light-bg: "#F8F8F5"
  light-fg: "#161616"
  light-surface: "#FFFFFF"
  light-surface-subtle: "#ECEBE6"
  light-muted: "#5F5D57"
  light-line: "#D8D6CF"
  light-success: "#17643F"
  dark-bg: "#0C0C0D"
  dark-fg: "#F8F8F2"
  dark-surface: "#171719"
  dark-surface-subtle: "#202024"
  dark-muted: "#B7B5AE"
  dark-line: "#303036"
  dark-success: "#73D6A6"
  portrait-highlight: "#976E63"
  portrait-surface: "#493736"
  portrait-bg: "#271D1D"
  photo-ivory: "#FFF8ED"
  photo-mushroom: "#64504F"
  photo-coral: "#FF5A24"
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
    body-default: "1rem"
    body-large: "1.0625rem"
    lead-min: "1.05rem"
    lead-max: "1.25rem"
    hero-kicker-max: "1.15rem"
    section-title-min: "2.2rem"
    section-title-max: "3.75rem"
    group-title-min: "1.2rem"
    group-title-max: "1.55rem"
    card-title-min: "1.5rem"
    card-title-max: "2.15rem"
    subpage-title-min: "3.2rem"
    subpage-title-max: "5.5rem"
    display-min: "3.2rem"
    display-max: "5.8rem"
    contact-title-min: "3.5rem"
    contact-title-max: "6rem"
    mobile-card-title-min: "1.45rem"
    mobile-card-title-max: "1.9rem"
    mobile-section-title-min: "2.15rem"
    mobile-section-title-max: "2.8rem"
    mobile-page-title-min: "2.35rem"
    mobile-page-title-max: "3rem"
    mobile-display-min: "2.65rem"
    mobile-display-max: "3.65rem"
    mobile-contact-title-max: "4.25rem"
    editorial-heading: "1.875rem"
    editorial-heading-compact: "1.35rem"
    editorial-heading-wide: "1.75rem"
    editorial-heading-mobile: "1.8rem"
    mobile-heading-fixed: "2.85rem"
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

The design evolves the original live portfolio without sanding away its personality. It should feel like a precise personal site made by an engineer who enjoys making systems move: reactive geometry, one decisive orange-red signal, direct language, and concrete proof of work. The portrait remains a visual anchor, but the interface does not inherit its full sepia cast: clean paper, neutral ink, and crisp charcoal create separation while the saturated accent supplies energy.

Three voice words: **kinetic, capable, assured**.

The first viewport must answer what role Javier fits, what kind of systems he builds, and where to inspect the work. The portrait establishes identity; the project evidence establishes hireability.

## Identity to preserve

- Clean paper light and near-black dark themes with a vivid, readable orange-red accent that complements the portrait.
- Geist Sans for interface and narrative copy; Geist Mono only for dates and technical metadata.
- Formal portrait in a restrained rectangular frame.
- A reactive system trace: continuous paths absorb pointer disturbance, pass through quality
  checkpoints, and settle into order. One orange-red signal carries the motion; there are no grids,
  particles, or decorative glow.
- Direct links to selected projects and GitHub in the first viewport.
- Direct sections for background, technical practice, selected projects, and contact.

## Polish principles

- Do not use generated lifestyle imagery as a substitute for project evidence.
- Cards use a border or a shadow, never both. Current project cards use a border only.
- Card radii stop at `1rem`; the hero panel is the largest surface radius.
- Timeline entries are open rows rather than identical nested cards.
- Technologies are structured lists, not a wall of pills, and source or live links stay visible on project cards.
- Category styling remains neutral and consistent rather than assigning arbitrary colors.
- The interactive canvas is the signature visual. Keep it sparse, continuous, and physically calm;
  do not imitate it with decorative grids or node maps elsewhere.
- Avoid generic glow effects, repeated status dots, and fake operational metrics.

## Motion and performance

- Content is visible before JavaScript runs. Motion enhances hierarchy instead of unlocking content.
- Hero typography, the portrait, and the canvas enter as one rehearsed sequence.
- Project and experience motion uses stagger, clipping, and directional movement rather than repeating one fade-up.
- The animated field pauses in background tabs, caps device-pixel ratio, and becomes a static trace
  under reduced motion.

## Accessibility

- Body and muted text meet WCAG AA contrast in both themes.
- Button and link colors meet WCAG AA contrast in both themes.
- The mobile menu exposes its expanded state, closes with Escape, and prevents background scrolling.
- Focus indicators use a two-pixel orange outline with a four-pixel offset.
