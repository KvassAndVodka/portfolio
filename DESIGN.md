---
name: "Javier Raut Portfolio"
description: "An expressive, proof-led engineering portfolio where interactive systems, inspectable projects, verified experience, and technical writing reinforce one another."
colors:
  accent-light: "#B2350F"
  accent-dark: "#FF7342"
  accent-fill: "#FF5A24"
  accent-hover-light: "#9F2C0B"
  accent-hover-dark: "#FF926D"
  accent-ink-light: "#FFFFFF"
  accent-ink-dark: "#161616"
  light-bg: "#F3EDE2"
  light-fg: "#161616"
  light-surface: "#FBF7F0"
  light-surface-subtle: "#E9E1D3"
  light-muted: "#5F5D57"
  light-line: "#DCD3C4"
  light-success: "#17643F"
  dark-bg: "#1B1916"
  dark-fg: "#F8F8F2"
  dark-surface: "#23201C"
  dark-surface-subtle: "#2C2925"
  dark-muted: "#B7B5AE"
  dark-line: "#3A3631"
  dark-success: "#73D6A6"
  portrait-highlight: "#976E63"
  portrait-surface: "#493736"
  portrait-bg: "#271D1D"
  photo-ivory: "#FFF8ED"
  photo-mushroom: "#64504F"
  photo-coral: "#FF5A24"
  postcard-rust: "#A3300E"
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

# Design System: Postcard from the Map

## Creative direction

The site is a postcard sent from the places Javier has worked. The home page opens on a live 3D
map of Northern Mindanao (flat 2D on phones and low-power devices) with one straight cream card
laid over it: a cutout portrait on an orange panel on the left, and the message side on the right.
The scroll then flies the camera through each place. It should feel like a precise personal site
made by an engineer: clean paper, neutral ink, one decisive orange signal, direct language, and
concrete proof of work, with small technical and mapping details for people who look closely.

Three voice words: **kinetic, capable, assured**.

The first viewport must answer what role Javier fits, what kind of systems he builds, and where to
inspect the work. The portrait establishes identity; the project evidence establishes hireability.

## Identity to preserve

- Clean paper light and near-black dark themes with a vivid, readable orange accent.
- Geist Sans for interface and narrative copy; Geist Mono for labels, coordinates, dates, and
  navigation.
- The wordmark is "JR." and the full name is "Javier Raut." — the full stop is always the accent
  orange (`#FF5A24`), the letters are ink.
- The map is the signature visual. Keep it calm; text sits on solid or frosted surfaces over it,
  never directly on busy terrain.
- Direct links to projects, resume, GitHub, and LinkedIn in the first viewport.

## The postcard (home hero)

- One cream card (`photo-ivory`, `#FFF8ED`), straight and centred, with a faint 20 px graph-paper
  grid and a soft drop shadow. No tilt.
- Left: an orange panel (`#FF5A24`) holding the background-removed portrait. The head may rise
  above the card's top edge; nothing else breaks the card.
- Orange-panel details, all ink on orange: a short italic place line ("Northern Mindanao"), a mono
  coordinate caption ("FIG. 01 — 08°29′N 124°41′E"), nested contour rings at about 30% opacity
  (rings never cross; every fifth is heavier), and a north arrow with a scale bar in the bottom
  left.
- Right, top to bottom: the name in heavy uppercase ink, the role line, the summary (italic), the
  current roles (mono `postcard-rust` labels over plain detail), and one row of equal buttons:
  Projects (solid ink), Resume, GitHub, LinkedIn (outlined).
- One perforated stamp in the top-right corner: orange, pin icon, "PHILIPPINES / CDO".
- Hero copy comes from `places.ts` and the existing summary; do not invent new taglines.
- Dark mode: the card and header turn to the dark paper (`#2A2723`, a warm charcoal) with light text and
  `#FF7342` labels. The orange panel, its ink details, the stamp, and the Contact tab stay the same
  in both themes.

## Header

- A ticket strip in the card colours, as wide as the page shell (`82rem`), with a soft shadow.
- A stub on the left holds "JR." and is split from the links by a dashed tear line.
- Links in mono uppercase; Contact is an orange tab with an arrow at the far right.
- The same header is used on every public page.

## Home projects (the gallery)

- The projects sit on the drifting ASCII cloud. On desktop the section pins and vertical scroll moves
  a horizontal track: a title slide, then one card per featured project. Each card snaps to the
  centre, and the pin ends with the last card centred before the page moves on.
- Each card is an atlas page on cream paper with a shadow and straight corners: a ticket strip
  ("FIG. 01 / 03", category, year), the picture on the left, then title, summary, "What changed"
  (when set), "Built with", and the actions. Live and source links stay visible.
- The picture is the project screenshot. Without one, an ASCII plate of the project's mark stands in,
  drawn with the cloud's own glyphs; it develops when its card arrives.
- Progress shows as a map scale bar. Text over the cloud sits on a paper scrim, never on bare glyphs.
- Phones and reduced motion: no pin; the cards stack vertically.

## How I build (the spec sheet)

- Built to be scanned: one card per practice area with recognisable tool logos and names, then the
  full toolkit as plain text by category, always visible.

## Polish principles

- Details must be legible to a normal visitor. Prefer universal map symbols (north arrow, scale bar,
  coordinates, contours) over insider references. No in-jokes such as HTTP codes, loopback
  addresses, or projection codes.
- Do not overlap text with the portrait. Move the text, not the photo.
- Use the postcard vocabulary (cream surface, stamps, mono labels) in the hero, the header, the contact
  section, and the home page's project and practice-area cards. Notes, archives, and the projects
  index stay plain.
- Do not use generated lifestyle imagery as a substitute for project evidence.
- Cards use a border or a shadow, never both. Projects-index cards use a border only; the home page's
  gallery and practice-area cards use the postcard shadow only.
- Card radii stop at `1rem`; buttons inside the postcard use `8px`.
- Technologies are structured lists, not a wall of pills, and source or live links stay visible on
  project cards.
- Avoid generic glow effects, repeated status dots, and fake operational metrics.

## Motion and performance

- Content is visible before JavaScript runs. Motion enhances hierarchy instead of unlocking content.
- The map runs in 3D on capable desktops and drops to the flat 2D map on phones, software
  rendering, and low-memory devices.
- The map pauses in background tabs, caps device-pixel ratio, and stays still under reduced motion.

## Accessibility

- Body and muted text meet WCAG AA contrast in both themes, including text on the orange panel and
  on the cream card (ink on orange is 5.8:1; `postcard-rust` on cream is 6.7:1).
- No text relies on transparency for its colour; faded rings and lines are decoration only.
- Button and link colors meet WCAG AA contrast in both themes. Touch targets are at least 44 px.
- The mobile menu exposes its expanded state, closes with Escape, and prevents background scrolling.
- Focus indicators use a two-pixel orange outline with a four-pixel offset.
