# Enigmus Style Guide

The design system of enigmus.cc, taken from the Enigmus WebUI. The hero chat
window (`AppWindow`) is the reference: every surface, control and type size
derives from it. `/elements` renders every element and shortcode; copy rules
are in `CLAUDE.md`.

| File | Holds |
| :-- | :-- |
| `styles/base.scss` | 18px root font size (rem utilities scale from it), body, heading defaults |
| `styles/design.scss` | CSS variables (light/dark), `.page-content` prose, `.terminal-block` |
| `styles/fonts.scss`, `public/fonts/` | the self-hosted fallback fonts |
| `tailwind.config.js` | brand colors, font stacks, breakpoints |
| `layouts/PageShell.js`, `layouts/*Layout.js` | page shell and layouts |
| `layouts/components/site/` | components |

## Principles

- **Flat**: no gradients, glass, glow or decorative motion. Hover changes
  color or opacity only.
- **Three surfaces**, split by 1px hairlines, not shadows: canvas `--bg`;
  chrome `--brand-wash` (nav, hero, chat sidebar); raised `--surface` (bars,
  active items, composer, cards).
- **Selection is a surface, not a color**: the active item gets `--surface`
  and a `--border` hairline; inactive items keep a transparent border, so
  nothing shifts.
- **Four text steps**: `--text` titles, `--text-muted` body, `--text-dim`
  secondary UI, `--text-faint` meta, placeholders and idle icons.
- **Blue in small doses**: wash, hairlines, icons, links, 6px dots and one
  filled control (the send button); never a large fill.
- **Mono only** for labels, dates, counters and code.

## Colors

Brand, from the app icon: `brand` `#1FA3FB` for dots, icons, the send button
and tints (never text on white, 2.7:1); `brand-deep` `#0D6FD1` for accent text
and filled buttons on light. Accent text on dark is `--accent-on-bg`.

| Variable | Light | Dark |
| :-- | :-- | :-- |
| `--bg` | `#F5F6F8` | `#0B0B0B` |
| `--surface` | `#FFFFFF` | `#141414` |
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

Fixed colors, the same in both themes: status green `#10B981`, user-bubble text `#0B5FB3`
(dark `#D6EFFF`), device bezel `#111214`, terminal `#0D1117` with a `#161B22`
bar.

Buttons: primary `--text` fill with a `--bg` label; secondary `--surface` with
a `--border` hairline; content buttons (shortcode `Button`, 404, active page)
`bg-brand-deep` with white text; icon buttons 36px square, `--text-dim`.

## Typography

Both faces are Apple's system fonts, which can't be self-hosted. Each has a
self-hosted fallback (a Fontsource latin woff2, OFL) that Apple's browsers
never download. Nothing comes from Google Fonts or a CDN.

| Stack | Use | Fallback |
| :-- | :-- | :-- |
| SF Pro (`-apple-system`, `BlinkMacSystemFont`) - `font-sans` | all text | Inter, optical-size axis, 71 KB |
| SF Mono (`ui-monospace`, WebKit only) - `font-mono` | labels, dates, counters, code | IBM Plex Mono 400/500, 15 KB each, used by Firefox and probably Chrome |

Keep mono at weight 400 or 500. Tracking: none up to 17px; headings -0.007em
(24-28px), -0.01em (19-56px), -0.015em (72px and up). Never copy apple.com's
letter-spacing: it is for web-font copies of SF Pro, and the system copy
already applies its own size-specific tracking.

| Role | Size / line-height (px) | Weight, tracking |
| :-- | :-- | :-- |
| Hero H1 | 40 -> 48 / 1.05 | 600, -0.01em |
| Page H1 | 34 -> 52 (contact, download 36 -> 56; blog, category 36 -> 44; post 30 -> 44) | 600, -0.01em |
| 404 code | 72 -> 104 | 600, -0.015em |
| Section H2 | 20 | 600, -0.01em |
| Card title | 14-15 | 600 |
| Body (hero subtitle, page intros) | 15.5 -> 17.5 / 1.6-1.65 | 400 |
| Prose | p 16 / 1.7, li 15.5 / 1.65, td 14.5; h1 30 -> 34, h2 24 -> 28, h3 19 -> 21, h4 17, h5 15.5, h6 14 | 400; headings 600 |
| UI text | 13-15 (nav 14, post titles 15 / 500) | 400-500 |
| Chat view | messages 13.5 / 1.6, UI 10-12.5 | 400 |
| Meta | 10-12.5 | 400 |
| Label | mono 11, uppercase, `--text-faint` | 500, 0.1em |
| Wordmark | 12, uppercase | 600, 0.2em |

Prose rules (`.page-content`) sit in `:where()`, so Tailwind utilities inside
content always win.

## Shape and layout

- Radii: 6 tags; 8 nav links; 9-10 chips, buttons, list items; 11 content
  buttons; 14 windows, bubbles, composer, accordions; 18 page cards and post
  hero images.
- Shadows in light mode only: `--shadow-card` on cards, accordions and tabs, a
  soft drop under the hero window and device bezels. The mobile nav sheet
  keeps its shadow in dark.
- Hairline grids: a 1px `gap` over a `--border` background, not per-cell
  borders.
- Layout: 1200px container, 16px gutters (32 from `md`), 56px nav, 760px prose
  column, homepage sections 56 -> 80px apart.
- Breakpoints: `sm` 540 (chat sidebar), `md` 768 (content layouts), `lg` 992
  (nav links, two-column hero), `xl` 1280.
- Icons (`Icon`): one path on a 24px grid, stroke 1.8, round caps, no fill,
  `currentColor`; 12px in chips and buttons, 14px in toolbars, 16px alone.

## Chat view (`AppWindow`)

A mock of the app and the pattern for new UI; exact values are in the
component. The four chat items are buttons that swap the thread, model and
context count.

| Part | Look | Reused by |
| :-- | :-- | :-- |
| Window | radius 14, `--brand-line` border, `--bg` canvas | - |
| Sidebar | `--brand-wash`, from `sm` | nav bar (wash, `--brand-line` bottom) |
| Chat item | radius 10; active `--surface` + `--border` | active nav link; `PostList` rows |
| Status | 6px green dot, `--text-faint` "Offline" | hero eyebrow |
| Model picker | hairline chip, 6px `brand` dot | tags, chips |
| User bubble | radius 14, `bg-brand/10`, `border-brand/25`, bubble text color | - |
| Reply | no bubble, `--text-muted`, max 90% wide | - |
| Composer | `--surface`, hairline, radius 14 | cards, accordions, blockquotes, mobile nav sheet |
| Send | 26px `brand` circle, white arrow | - |

A11y: `role="figure"` with an `aria-label`, chat items `aria-pressed`, thread
`aria-live="polite"`, decorative parts `aria-hidden`.

## Code

- Inline: `--code-inline-text` on `--code-inline-bg`.
- Fenced (`CodeBlock` -> `.terminal-block`): a terminal window, dark in both
  themes, with traffic lights, a mono language label and GitHub Dark tokens
  (`rehype-highlight`, plus `lib/utils/rehypeShellTokens.js` for shell commands
  and flags).
- In a chat reply (`.terminal-block--compact`): smaller, no traffic lights; in
  light mode the user bubble's blue with Xcode Midnight Light tokens.

## Components

- `PageShell` (SEO head, nav, footer) wraps every page. Layouts:
  `ArticleLayout` (default; `heading`, `heading_accent`, `intro` frontmatter),
  `DownloadLayout`, `ContactLayout`, `404`.
- Homepage: `Hero` (copy, `AppStoreButton`s, `AppWindow`), `Features`,
  `DeviceShowcase`, `LLMServer`, `RecentPosts`.
- Every post listing uses `PostList`: one hairline row per post.
- Device frames (`IPhoneFrame`, `IPadFrame`, `MacBookFrame`): flat bezel with a
  hairline ring, no buttons or notch, sized in `cqw`; callers set the width.
- Shortcodes (`Notice`, `Accordion`, `Button`, `Tabs`, media) follow the same
  rules.

## Theming

`next-themes`, `attribute="class"`, `default_theme: "system"`; light when the
system has no preference. Tailwind carries only the brand colors and the two
font stacks; everything else uses its defaults or the CSS variables.
