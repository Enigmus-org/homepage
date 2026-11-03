# Enigmus Style Guide

The design system of enigmus.cc, taken from the Enigmus WebUI. The reference is
the hero chat window (`AppWindow`): every surface, control and type size on the
site derives from it. Flat neutral surfaces, 1px hairlines, one text family,
the Enigmus blue used gently. No gradients, glass, glow or decorative motion.
`/elements` renders every element and shortcode.

Code:

- `styles/design.scss` - CSS variables (light/dark), `.page-content` prose, `.terminal-block`
- `tailwind.config.js` - brand colors, font families, breakpoints
- `layouts/PageShell.js`, `layouts/*Layout.js` - page shell and layouts
- `layouts/components/site/` - components; `AppWindow.js` is the reference
- `lib/fonts.js` - webfont loading

## Principles

- **Three surface levels**, separated by 1px hairlines, not shadows: canvas
  `--bg`; chrome `--brand-wash` (nav, hero, chat sidebar); raised `--surface`
  (bars, active items, composer, cards).
- **Selection is a surface, not a color**: the active item gets `--surface` +
  a `--border` hairline; inactive items keep a transparent border, so nothing
  shifts.
- **Four text steps**: `--text` titles, `--text-muted` body, `--text-dim`
  secondary UI, `--text-faint` meta, placeholders, idle icons.
- **Blue in small doses**: wash, hairlines, icons, 6px dots, one filled control
  (the send button).
- **Mono only** for labels, dates, counters and code.

## Colors

Brand (Tailwind names, from the app icon):

| Token | Value | Use |
| :-- | :-- | :-- |
| `brand` | `#1FA3FB` | dots, icons, send button, tints - never text on white (2.7:1) |
| `brand-deep` | `#0D6FD1` | accent text, filled content buttons on light (5:1 on white) |
| `brand-sky` | `#5EC0FF` | accent text on dark |

CSS variables (`styles/design.scss`, swapped by `.dark`):

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
| `--code-inline-bg` | `rgba(214,62,40,.08)` | `rgba(255,96,72,.13)` |
| `--code-inline-text` | `#C2410C` | `#FFA657` |
| `--shadow-card` | `0 1px 2px rgba(0,0,0,.04)` | `none` |

Fixed colors, the same in both themes unless noted: status green `#10B981`;
user-bubble text `#0B5FB3` (dark `#D6EFFF`); device bezel `#111214`; terminal
`#0D1117` body, `#161B22` bar.

Where the blue goes:

- `--brand-wash` + `--brand-line` bottom border: nav bar, homepage hero, chat
  sidebar. Flat fills only.
- `--accent-on-bg`: feature icons, prose links, list markers, hover on titles.
- `brand`: dots, send button, user bubble (`bg-brand/10`, `border-brand/25`),
  tag tint (`bg-brand/[0.14]`), blockquote left rule.

Buttons:

- Primary: fill `--text`, label `--bg`; hover opacity .9.
- Secondary: `--surface` + `--border`; hover border `--text-faint`.
- Content (shortcode `Button`, 404, active page in pagination): `bg-brand-deep`,
  white, radius 11px (pagination 10px).
- Icon button: 36px square, radius 10px, `--text-dim`; hover `--surface` fill.
- Heights: store buttons 44px (14px/500), nav Download 36px (13.5px/500).

## Typography

- **Inter Variable** (`font-sans`, `font-display`, `font-heading`) - all text but
  labels; `@fontsource-variable/inter`, imported in `pages/_app.js`
- **IBM Plex Mono** 400/500/600 (`font-mono`) - labels, dates, counters, code;
  `next/font` in `lib/fonts.js`, exposed as `--font-ibm-plex-mono`

| Role | Size / line-height | Weight, tracking |
| :-- | :-- | :-- |
| Hero H1 | 40 -> 48px / 1.05 | 700, -0.03em |
| Page H1 | 34 -> 52px (contact, download 36 -> 56) / 1.05 -> 1.02 | 800, -0.03em |
| Section H2 | 20px | 600, -0.01em |
| Card title | 14-15px | 600 |
| Body | 16px / 1.65 | 400 |
| UI text | 13-15px (nav 14, post titles 15/500) | 400-500 |
| Chat message | 13.5px / 1.6 | 400 |
| Meta | 10-12.5px | 400 |
| Label | mono 11px, uppercase, `--text-faint` | 500, 0.1em |
| Wordmark | 12px, uppercase | 600, 0.2em |

Prose (`.page-content`): p 16px/1.7, li 15.5px/1.65, h1 30 -> 34, h2 24 -> 28,
h3 19 -> 21, h4 17, h5 15.5, h6 14. Its rules sit in `:where()` (zero
specificity), so Tailwind utilities inside content always win. All headings
take `var(--text)` from `styles/base.scss`.

## Shape, depth, layout

- Radii: 6px tags; 8px nav links; 9-10px chips, buttons, list items; 11px
  content buttons; 14px windows, panels, bubbles, composer, accordions; 18px
  page cards and post hero images; full for dots and the send button.
- Shadows, all light-mode only except the last: `--shadow-card` (cards,
  accordions, tabs); hero window `0 24px 48px -28px rgba(13,111,209,.35)`;
  device bezels `0 1px 2px rgba(0,0,0,.06), 0 24px 48px -28px rgba(0,0,0,.4)`;
  mobile nav sheet `0 12px 32px -16px rgba(0,0,0,.3)`.
- Hairline grids: a 1px `gap` over a `--border` background instead of per-cell
  borders (homepage fact row, device showcase).
- Layout: 1200px container, 16px gutters (32px from `md`); 56px nav; 760px
  prose column; homepage sections 56 -> 80px apart.

## Chat view (`AppWindow`)

A mock of the app, and the pattern for any new UI. Values in px. The three
chat items are buttons: each swaps in its own thread, model and context count.

| Part | Spec |
| :-- | :-- |
| Window | Grid, radius 14, 1px `--brand-line`, canvas `--bg`, height 380 -> 440 (`md`); the hero-window shadow in light |
| Sidebar | 180px column from `sm`, hidden below; `--brand-wash`, right hairline, padding 10, gap 6, text 11.5 |
| New Chat | `--surface`, hairline, radius 10, 8 vertical padding, `--text-dim`, 12px plus icon |
| Chat item | Button, radius 10, padding 10 x 8, title + 10px `--text-faint` time; active = `--surface` + `--border` + `--text`, others transparent border + `--text-dim`, hover `--text` |
| Top bar | `--surface`, bottom hairline, padding 14 x 10; model picker left, status right |
| Model picker | Radius 9, hairline, padding 10 x 6, 12.5px; 6px `brand` dot, model name, 12px faint chevron |
| Status | 6px `#10B981` dot + 11px `--text-faint` ("Offline") |
| Thread | Padding 20, gap 14, 13.5px / 1.6; scrolls (hidden scrollbar) and opens at the latest message when taller than the window |
| User bubble | Right-aligned, radius 14, padding 14 x 8, `bg-brand/10`, `border-brand/25`, text `#0B5FB3` / `#D6EFFF` |
| Assistant reply | No bubble: plain `--text-muted`, max-width 90% |
| Thinking | Above a reply: 12px lightning + 11.5px `--text-faint` ("Thought for 6s"); the composer's lightning toggle turns `brand` while thinking is on |
| Composer | Inset 16 from sides and bottom; `--surface`, hairline, radius 14, padding 12 x 10/8; 13px faint placeholder; toolbar (gap 12) of the 14px lightning thinking toggle, a mono 11px context counter pushed right, send button |
| Send | 26px circle, `brand` fill, white 12px up-arrow at stroke 2.4 |
| A11y | `role="figure"` + a descriptive `aria-label`; chat items `aria-pressed`; thread `aria-live="polite"`; New Chat and composer `aria-hidden` |

The rest of the site reuses these parts:

| Site element | Chat-view part |
| :-- | :-- |
| Nav | Top bar on the wash: `--brand-wash`, `--brand-line` bottom, 14px `--text-dim` links, radius 8; active link styled like the active chat item |
| Hero eyebrow | Status: 6px green dot + 13px `--text-faint` |
| `PostList` rows | Chat items as hairline rows: mono 12.5px date, 15px/500 title (hover `--accent-on-bg`), 11px tags at radius 6 |
| Cards, accordions, blockquotes | Composer: `--surface`, hairline, radius 14 (page cards 18) |
| Tags, chips | Model picker: hairline, small radius, 11-12.5px |
| Mobile nav sheet | Composer surface, radius 14, plus the sheet shadow |

## Icons

`Icon` (`layouts/components/site/Icon.js`): one path on a 24px grid, stroke 1.8,
round caps and joins, `currentColor`, no fill. Sizes: 12px inside chips and
buttons, 14px in toolbars, 16px standalone. The send arrow uses stroke 2.4.

## Interaction and motion

Hover changes color only: text to `--text` or `--accent-on-bg`, icon buttons
gain `--surface`, primary buttons drop to opacity .9, secondary borders darken
to `--text-faint`. No motion beyond color/opacity transitions; respect
`prefers-reduced-motion` if anything animated is added.

## Breakpoints

`sm` 540, `md` 768, `lg` 992, `xl` 1280. Content layouts switch at `md`; the
nav link row and the two-column hero appear at `lg`; the chat sidebar appears
at `sm`.

## Components

- Shell: `PageShell` (SEO head + nav + footer) wraps every page.
- Layouts: `ArticleLayout` (default, no `layout` field; `heading`,
  `heading_accent`, `intro` frontmatter, heading falls back to `title`),
  `DownloadLayout` (`layout: download`), `ContactLayout` (`layout: contact`), `404`.
- Homepage: `Hero` (copy, `AppStoreButton`s, `AppWindow`), `Features`,
  `DeviceShowcase`, `LLMServer` (Mac frame + `curl` terminal block, request
  diagram, hairline row of use cases), `RecentPosts` (`PostList` + `SubscribeFeed`).
- Post listings (homepage, blog index, category, search, related posts) all use
  `PostList`: one hairline row per post, optional excerpt.
- Library: `Nav`, `Footer`, `ThemeToggle`, `Icon`, `PostList`, `Pagination`,
  `DeviceFrames`. Shortcodes (`Notice`, `Accordion`, `Button`, `Tabs`, media)
  follow the same rules; see `/elements`.

Device frames: `IPhoneFrame`, `IPadFrame`, `MacBookFrame` - flat `#111214` bezel
with a hairline ring, no buttons, notch or shading; the Mac adds a flat
keyboard bar. Sized in `cqw`, so any width keeps the proportions; callers set
width and spacing via `className`. `DeviceShowcase` gives each device a column
on a hairline grid (iPhone, iPad, Mac, by memory): a screenshot, the same spec
rows (RAM, model budget, largest model), a caption.

Code: inline `` `code` `` is `--code-inline-text` on `--code-inline-bg`.
Fenced blocks are a terminal window, dark in both themes (`CodeBlock` ->
`.terminal-block`): traffic lights, mono language label, GitHub Dark colors via
`rehype-highlight` at build time, plus `lib/utils/rehypeShellTokens.js` for the
commands and flags its bash grammar leaves plain.

## Theming

`next-themes`, `attribute="class"`, `default_theme: "system"`
(`config/config.json`); with no system preference it resolves to light.
Theme-dependent values go through the CSS variables; only the fixed colors
listed above are hardcoded.

Leftovers from the previous theme - Tailwind `violet`, `teal`, `ink`, `paper`,
`slate`, `graphite`, the `borderRadius` set (`card`, `panel`, `nav`, `btn`,
`chip`) and the `config/theme.json` colors (`bg-body`, `darkmode-*`) - are not
part of this system; new work uses the variables and values above.

## Writing style

Copy rules (no direct reader address, no sales language, editorial tone) live in
`CLAUDE.md` and apply to all site content.
