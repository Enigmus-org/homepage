# Enigmus Style Guide

The design system used across enigmus.cc. It follows the Enigmus WebUI: flat
neutral surfaces, hairline borders, one text family, and the Enigmus blue used
gently - a light wash behind the nav and hero, hairlines, icons and accent
text. No gradients, glass, glow or decorative motion. The live visual
reference is the `/elements` page, which renders every element and shortcode.

Where it lives in code:

- `styles/aurora.scss` - semantic CSS variables (light/dark) + `.aurora-content` typography
- `tailwind.config.js` - `theme.extend` tokens (brand colors, fonts, radii)
- `layouts/components/aurora/` - the component library
- `layouts/Aurora*.js` - page shells and layouts
- `lib/fonts.js` - webfont loading

(The `aurora` names are historical; the Aurora Glass look they once described
is gone.)

## Colors

Brand palette (Tailwind names), taken from the app icon:

| Token | Value | Use |
| :-- | :-- | :-- |
| `brand` | `#1FA3FB` | dots, icons, send button, hairlines - never body text on white (2.7:1) |
| `brand-deep` | `#0D6FD1` | accent text and filled brand buttons on light (5:1 on white) |
| `brand-sky` | `#5EC0FF` | accent text on dark |

Semantic CSS variables (swap on `.dark`, set in `styles/aurora.scss`):

| Variable | Light | Dark |
| :-- | :-- | :-- |
| `--bg` | `#F5F6F8` | `#0B0B0B` |
| `--surface` / `--surface-solid` | `#FFFFFF` | `#141414` |
| `--border` | `rgba(0,0,0,.09)` | `rgba(255,255,255,.08)` |
| `--text` | `#121212` | `#E8E8E8` |
| `--text-muted` | `#3D3D3D` | `#BDBDBD` |
| `--text-dim` | `#5F636B` | `#9B9B9B` |
| `--text-faint` | `#858A93` | `#707070` |
| `--accent-on-bg` | `#0D6FD1` | `#5EC0FF` |
| `--brand-wash` | `#EEF6FD` | `#0C141D` |
| `--brand-line` | `rgba(31,163,251,.28)` | `rgba(94,192,255,.22)` |

How the brand blue is used, from most to least visible:

- `--brand-wash` + a `--brand-line` bottom border: the nav bar on every page and
  the homepage hero band. Flat fills only.
- `--accent-on-bg`: icons in the homepage fact row, link hover, prose links.
- `brand`: status/model dots, the chat send button, the user bubble tint
  (`bg-brand/10`, `border-brand/25`).

Primary buttons are solid `var(--text)` on `var(--bg)` (black on light, light
grey on dark); secondary buttons are `--surface` with a `--border` hairline.
`bg-brand-deep` is kept for content-level buttons (shortcode `Button`,
pagination, 404).

## Typography

Two families:

- **Inter Variable** (`font-sans`, `font-display`, `font-heading`) - everything
  but labels, from `@fontsource-variable/inter`
- **IBM Plex Mono** (`font-mono`) - dates, labels, code; loads via `next/font`
  in `lib/fonts.js` and is exposed as `--font-ibm-plex-mono`

Key scales:

- Homepage H1: 40px mobile / 48px desktop, weight 700, tracking -0.03em
- Section headings: 20px, weight 600
- Body: 16px / 1.65; small copy 12.5-13.5px
- Long-form content: styled by `.aurora-content` (p 16px/1.7, li 15.5px, h2 24->28px)

Headings take `var(--text)` from the global rule in `styles/base.scss`, in
both themes.

`.aurora-content` uses `:where()` so its rules have zero specificity - Tailwind
utilities on elements inside content always win.

## Shape and depth

- Radii: 10px buttons and nav items, 14px windows and panels, 6px tags
- Borders do the separating; shadows are near-absent. `--shadow-card` is a
  1px hint on light and `none` on dark. The two larger shadows (hero app
  window, device frames) are light-mode only.
- Hairline grids: the homepage fact row uses a 1px grid gap over a
  `--border` background instead of per-cell borders

## Device frames

`layouts/components/aurora/DeviceFrames.js` exports `IPhoneFrame`,
`IPadFrame` and `MacBookFrame`: a flat `#111214` bezel with a hairline ring,
no buttons, notch or shading; the Mac adds a flat keyboard-deck bar. Every
metric is in `cqw`, so a frame keeps its proportions at any width - callers
set width and spacing through `className`. `DeviceShowcase` places all three
as one group (Mac centered, iPad and iPhone in front of its lower corners).

## Motion

None beyond color and opacity transitions on hover. Respect
`prefers-reduced-motion` if anything animated is added.

## Breakpoints

- Content layouts switch at `md` (768px)
- The nav link row and the hero's two-column layout appear at `lg` (992px)
- The hero app window drops its conversation list below `sm` (540px)

## Components

Shells: `AuroraBase` (SEO head + nav + footer) wraps every page.
Layouts: `AuroraArticle` (default for content pages; `heading`/`heading_accent`/`intro`
frontmatter, heading falls back to `title`), `AuroraDownload`, `AuroraContact`, `404`.
Homepage: `Hero` (copy + `AppStoreButton`s + `AppWindow`), `Features`,
`DeviceShowcase`, `RecentPosts` (`PostList` + `SubscribeFeed`).
Post listings (homepage, blog index, category, search, a post's related
posts) all use `PostList`: one hairline row per post with date, title and
categories, plus an optional excerpt.
Library (`layouts/components/aurora/`): `Nav`, `Footer`, `ThemeToggle`, `Icon`,
`PostList`, `Pagination`, `DeviceFrames`. Shortcodes (`Notice`, `Accordion`,
`Button`, `Tabs`, media) are styled to match - see `/elements`.

Code: inline `` `code` `` is orange on a gentle red wash (`--code-inline-text` /
`--code-inline-bg`, the block's flag orange in dark); fenced blocks are a
terminal window, dark in both themes
(`CodeBlock` -> `.terminal-block`). Highlighting is `rehype-highlight` at build
time in GitHub Dark colors, plus `lib/utils/rehypeShellTokens.js` for the shell
commands and flags its bash grammar leaves plain.

## Theming

`next-themes` with `attribute="class"`; default follows the system and resolves to
light when no preference exists. All theme-dependent values go through the CSS
variables above - components should not hardcode per-theme colors except fixed
ones (status green `#10B981`, the device bezel, the user-bubble text).

## Writing style

Copy rules (no direct reader address, no sales language, editorial tone) live in
`CLAUDE.md` and apply to all site content.
