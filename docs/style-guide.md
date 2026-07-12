# Enigmus Style Guide — "Aurora Glass"

The design system used across enigmus.cc: a dark-first aurora glow + glassmorphism
aesthetic with light/dark themes. This documents the system **as built**. The live
visual reference is the `/elements` page, which renders every element and shortcode.

Where it lives in code:

- `styles/aurora.scss` — semantic CSS variables (light/dark) + `.aurora-content` typography
- `tailwind.config.js` — `theme.extend` tokens (colors, radii, gradients, shadows, animations)
- `layouts/components/aurora/` — the component library
- `layouts/Aurora*.js` — page shells and layouts
- `lib/fonts.js` — webfont loading

## Colors

Brand palette (Tailwind names):

| Token | Value | Use |
| :-- | :-- | :-- |
| `brand` | `#1FA3FB` | signature blue, primary accent |
| `brand-deep` | `#0D6FD1` | gradient end; accent on light backgrounds |
| `brand-sky` | `#5EC0FF` | light accent (dark-mode hover) |
| `brand-mist` | `#9FE0FF` | pale accent text on dark |
| `violet` | `#6D5EF5` | aurora + gradient secondary |
| `teal` | `#14C7C7` | aurora tertiary |

Semantic CSS variables (swap on `.dark`, set in `styles/aurora.scss`):

| Variable | Light | Dark |
| :-- | :-- | :-- |
| `--bg` | `#F4F7FC` | `#070A12` |
| `--surface` (glass) | `rgba(255,255,255,.72)` | `rgba(255,255,255,.05)` |
| `--surface-solid` (cards) | `#FFFFFF` | `rgba(255,255,255,.04)` |
| `--chat-surface` | `rgba(255,255,255,.72)` | `rgba(12,17,28,.72)` |
| `--border` | `rgba(12,18,32,.10)` | `rgba(255,255,255,.09)` |
| `--text` | `#0C1220` | `#E8ECF5` |
| `--text-muted` | `#46506A` | `#AEB6C6` |
| `--text-dim` | `#5A6478` | `#9AA3B4` |
| `--text-faint` | `#8A93A6` | `#6B7488` |
| `--accent-on-bg` | `#0D6FD1` | `#9FE0FF` |

Rule of thumb: accent text sitting directly on the page background uses
`var(--accent-on-bg)` — the accent deepens on light, softens on dark.

## Typography

Three families (kept deliberately minimal — do not add families):

- **Sora** (`font-display`, `font-heading`) — display headlines and headings, weights 400–800
- **Inter Variable** (`font-sans`, also the site-wide `font-primary`) — body text
- **IBM Plex Mono** (`font-mono`) — labels, meta, dates, microcopy, weight 500

Sora and IBM Plex Mono load via `next/font/google` in `lib/fonts.js` and are exposed
as `--font-sora` / `--font-ibm-plex-mono`; Inter comes from `@fontsource-variable/inter`.

Key scales:

- Hero H1: 44px mobile / 82px desktop, weight 800, tracking −0.03/−0.04em, leading ≤1
- Page headings: 34–56px, weight 800
- Section headings: 22px mobile / 30px desktop, weight 700
- Long-form content: styled by `.aurora-content` (p 16px/1.7, li 15.5px, h2 24→28px)
- Mono microcopy: 10.5–13px, medium, often `uppercase tracking-[0.1em]` for labels

`.aurora-content` uses `:where()` so its rules have zero specificity — Tailwind
utilities on elements inside content always win.

## Radii

| Token / value | Use |
| :-- | :-- |
| `rounded-chip` (999px) | pills, chips |
| `rounded-[18px]` / `rounded-2xl` | post/platform cards |
| `rounded-nav` (16px) | desktop nav bar |
| `rounded-[14px]` | mobile nav/sheet, accordions, notices, inputs |
| `rounded-btn` (14px) | store buttons |
| `rounded-[11px]` | CTA buttons |
| `rounded-panel` (22px) / `rounded-[21px]` | chat card outer/inner |

## Gradients

- Headline accent text: `bg-brand-text` (dark) / `bg-brand-text-light` (light) with
  `bg-clip-text text-transparent`; solid single-word accents use
  `text-brand-deep dark:text-brand`
- Buttons / active pills: `bg-brand-btn` = `linear-gradient(135deg,#1FA3FB,#0D6FD1)`
- Aurora blobs: radial gradients from `var(--aurora-blue/violet/teal)` (theme-aware alpha)
- Post-cover fallbacks: three 135° blue/navy/violet blends (see `PostCard.js`)

## Shadows

- Brand button: `shadow-btn-brand` / `0 6px 20px rgba(31,163,251,.4)` (nav CTA)
- Cards: `[box-shadow:var(--shadow-card)]` — soft blue-gray on light, deep black on dark
- Nav icon glow: `0 4px 16px rgba(31,163,251,0.35)`

## Motion

- Aurora drift: `animate-aurora` / `-slow` / `-slower` (20s / 26s reverse / 30s)
- Typing caret: `animate-blink` (1.1s step-end)
- Hover lifts: `-translate-y-px` buttons, `-translate-y-1` cards
- All animations disabled under `prefers-reduced-motion` (scoped block in `aurora.scss`)
- The mock's chat-card float animation was removed deliberately — do not reintroduce

## Breakpoints

- Content layouts switch at `md` (768px)
- The nav link row needs ~1000px, so it switches at `lg` (992px) — tablets keep the hamburger
- Deviations from the original mock, by decision: all three posts show on mobile,
  and the four hero chips share one line down to 360px

## Components

Shells: `AuroraBase` (SEO head + aurora field + nav + footer) wraps every page.
Layouts: `AuroraArticle` (default for content pages; `heading`/`heading_accent`/`intro`
frontmatter, heading falls back to `title`), `AuroraDownload`, `AuroraContact`, `404`.
Library (`layouts/components/aurora/`): `Nav`, `AuroraField`, `Hero`, `ChatCard`,
`AppStoreButton`, `FeatureChips`, `RecentPosts`, `PostCard`, `Pagination`, `Footer`,
`ThemeToggle`. Shortcodes (`Notice`, `Accordion`, `Button`, `Tabs`, `Code`, media)
are styled to match — see `/elements`.

## Theming

`next-themes` with `attribute="class"`; default follows the system and resolves to
light when no preference exists. All theme-dependent values go through the CSS
variables above — components should not hardcode per-theme colors except where the
mock specifies fixed values (traffic lights, offline green `#5FCB7F`).

## Writing style

Copy rules (no direct reader address, no sales language, editorial tone) live in
`CLAUDE.md` and apply to all site content.
