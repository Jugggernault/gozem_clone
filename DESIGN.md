---
version: alpha
name: Gozem Next — Premium African Mobility
description: Calm, confident mobility super-app for Bénin. Immersive map, white sheets, one decisive green, warm sun accent for rewards.
colors:
  primary: "#00A86B"
  primary-dark: "#007A4D"
  primary-soft: "#E6F6EF"
  on-primary: "#FFFFFF"
  accent: "#F5A524"
  accent-soft: "#FEF3DC"
  on-accent: "#1F1300"
  neutral: "#F7F8F6"
  surface: "#FFFFFF"
  surface-sunken: "#F0F2EE"
  on-surface: "#111827"
  muted: "#5B6472"
  border: "#E5E7EB"
  ink: "#0B1410"
  on-ink: "#FFFFFF"
  success: "#147A3A"
  warning: "#B45309"
  error: "#DC2626"
  on-error: "#FFFFFF"
  map-route: "#0B1410"
typography:
  hero:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.03em
  h1:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.025em
  h2:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  h3:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
  caption:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
  price:
    fontFamily: Geist Mono
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: '"tnum" 1'
  price-hero:
    fontFamily: Geist Mono
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.02em
    fontFeature: '"tnum" 1'
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  sheet-padding: 20px
  touch-target: 44px
components:
  button-primary:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 52px
    padding: 20px
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
  button-secondary:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: 16px
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    rounded: "{rounded.full}"
    height: 52px
  chip:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.on-surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 12px
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 20px
  ride-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 14px
  ride-option-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    height: 52px
    padding: 14px
  badge-promo:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.on-accent}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 6px
  gowin-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.xl}"
    padding: 24px
  balance-card:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: 24px
  nav-item-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.full}"
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
  meta-text:
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  status-success:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
  status-warning:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
  map-route-line:
    backgroundColor: "{colors.map-route}"
    height: 5px
---

# Gozem Next Design System

## Overview

**Premium African mobility.** The product should feel like a mature, trusted transport app used daily in Cotonou: calm, fast, legible in bright sunlight, and warm without being folkloric. The map is the stage. White sheets slide over it. There is one decisive green, and a sun-amber accent is kept for rewards and promos. Content is in French, prices are in FCFA, and the tone is friendly and direct ("Où allez-vous ?").

The personality is Uber's restraint plus a Gozem/West African warmth: generous white space, bold tight headlines, big tappable rows and quick spring motion. It must never look like an admin dashboard or a template.

## Colors

- **Gozem Green (primary #00A86B):** brand fills, map pins, route highlights, icons, selected indicators and large display surfaces. It is not used for small text on white, where it fails AA.
- **Deep Green (primary-dark #007A4D):** the colour of the primary CTA fill and of green text on white. It passes AA with white.
- **Mint (primary-soft #E6F6EF):** selected ride option, active nav pill, success backgrounds.
- **Sun Amber (accent #F5A524 / accent-soft #FEF3DC):** GoWin points, promo badges and stars. Text on amber surfaces uses on-accent #1F1300.
- **Ink (#0B1410):** headlines, map route line, selected chips, the GoWin card and CTA hover. It is a green-tinted near-black, never pure #000.
- **Limestone (neutral #F7F8F6):** page background. **Surface #FFFFFF** is used for cards and sheets. **surface-sunken #F0F2EE** is used for inputs and secondary buttons.
- **Muted (#5B6472):** metadata, captions and ETAs. Darkened from #6B7280 to pass AA on limestone.
- Semantic colours: success #147A3A (text-safe green, AA on white and mint), warning #B45309 (text-safe amber), error #DC2626. Pair each with an icon so meaning never relies on colour alone.

## Typography

**Geist** is used for everything, with **Geist Mono** plus tabular numerals for prices, ETAs, plates, balances and countdowns so digits don't jitter while animating. Headlines are bold with negative tracking. The body is 15–16px. Captions are 13px/500 in muted. Hierarchy follows the PRD: Hero 32, H1 28, H2 22, H3 18. Prices use a narrow no-break space as the thousands separator: `1 500 FCFA`. "FCFA" is set at about 0.7× size in muted weight next to the number.

## Layout

The design is mobile-first. On screens under 640px, map screens run full-bleed and content sits in bottom sheets with a 16px gutter and 20px sheet padding. A fixed 5-item bottom nav is shown, with safe-area insets respected. From 640 to 1024px the layout stays the same, with sheets capped at 480px and centred. From 1024px up, a 240px left sidebar and a 64px top bar hold the search, bell and avatar. Map flows fill the remaining area, and the sheet becomes a floating 420px panel docked left over the map with lg radius and elevation. Non-map pages use a 720px content column.

Spacing uses a 4/8 rhythm (xs 4, sm 8, md 16, lg 24, xl 32, 2xl 48). Every touch target is at least 44px, and primary CTAs are 52px tall and full-width inside sheets.

## Elevation & Depth

Hierarchy comes mostly from tone, with limestone behind white cards. Shadows appear only on things that float over the map:
- Sheets and floating panels: `0 -8px 32px rgba(11,20,16,0.12)`, plus a 36×4px grab handle in border colour.
- Floating map buttons (back, 🛡 Sécurité): white circles 44–48px with `0 4px 16px rgba(11,20,16,0.16)`.
- Cards on limestone: 1px border (#E5E7EB) or `0 1px 2px rgba(11,20,16,0.06)`, never both heavy.

There is no glassmorphism, except an optional light 8px blur on the top-bar scrim over the map.

## Shapes

The shape language is soft and confident: sm 8 for small tags and thumbnails, md 12 for inputs, lg 16 for cards and ride options, xl 24 for sheet top corners and the hero wallet/GoWin cards, and full for buttons, chips, nav pills and avatars. Map markers are custom shapes: the user is a green dot with a pulsing halo, the destination is an ink square pin, and the driver is a top-down vehicle icon in a white disc that rotates with its heading.

## Components

- **Ride option row:** icon tile (48px, surface-sunken, vehicle illustration/emoji), name and description plus a "· 2 places" capacity line, ETA in muted, and the price right-aligned in `price` mono. When selected it gets the mint background and a 2px primary-dark ring.
- **Bottom sheet:** spring (stiffness ≈ 400, damping ≈ 36), draggable between snap points, xl top radius.
- **Driver card:** avatar 56px, name in h3, ⭐ rating in amber plus trip count, and a plate shown as a mono "license plate" chip (ink border, sunken bg).
- **Balance card:** deep green, balance in `price-hero` white, eye toggle, and a row of 5 round action buttons below.
- **GoWin card:** ink background, amber star and points, and a tier progress bar in amber.
- **Toasts (sonner):** ink background, white text, green check icon, bottom-centre on mobile and bottom-right on desktop.
- **Skeletons:** surface-sunken blocks with a soft shimmer that match the final layout.
- **Success state:** animated SVG check that draws its stroke in a primary circle (≈450ms).

## Do's and Don'ts

- Do keep one primary CTA per screen, deep green and full-width in sheets.
- Do show the price before every confirm, large and in mono.
- Do use real Beninese places, names and FCFA everywhere. There is no lorem ipsum.
- Do animate fast (150–300ms UI, springs for sheets) and respect `prefers-reduced-motion`.
- Do give every icon-only button an `aria-label` and a visible focus ring (2px primary-dark, 2px offset).
- Don't use #00A86B for small text on white. Use primary-dark.
- Don't use gradients (except a subtle map-edge scrim), glassmorphism everywhere, neon or purple.
- Don't crowd cards. If a card has more than 4 pieces of information, split it or move the extra into a detail view.
- Don't use pure black or grey drop shadows. Tint them with ink.
- Don't make the tracking screen look like the other screens. It is the hero, with the most map, the most motion and the most polish.
