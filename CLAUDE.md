# CLAUDE.md

Enigmus homepage and blog: a Next.js static site (https://enigmus.cc) for Enigmus, a private on-device AI app on the [App Store](https://apps.apple.com/us/app/enigmus/id6771532268) for iPhone, iPad, and Mac. App Store copy lives in `docs/app-store-listing.md` and is exempt from the writing rules below.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run export   # static export to /out for GitHub Pages
npm run lint
```

`dev`, `build`, and `export` run `npm run generate` first, which writes the search JSON (`lib/jsonGenerator.js`) and the RSS/JSON feeds (`lib/feedGenerator.js`, gitignored output in `public/`).

## Structure

- `content/*.md` are pages (`pages/[regular].js`); `layout` frontmatter picks `download`, `contact`, or `404`, else the default article layout
- `content/posts/*.md` are posts (`pages/posts/[single].js`); `content/posts/_index.md` holds the blog index intro and description
- `lib/contentParser.js` loads content, `config/` holds site settings and menus
- Styling: Tailwind + SCSS, tokens in `styles/design.scss`. Flat design, Enigmus blue used gently, no gradients or glow. See `docs/style-guide.md` and the `/elements` page

## Posts

- Frontmatter: `title`, `date`, `image` (landscape cover, also the 1200x630 og:image), `image_alt`, `categories`, `featured`, `draft`
- `hero_iphone: /images/<base>` plus `hero_iphone_height` (height of the 1200-wide image) shows a portrait screenshot in the iPhone frame as the hero
- Inline screenshots go in `IPhoneFrame` (`<base>-600/-1200.webp`) or `IPadFrame` (`<base>-450/-900.webp`) from `layouts/components/site/DeviceFrames.js`; copy the usage from an existing post
- Posts ship as full HTML in the feeds. Frames become plain images there; other MDX shortcodes do not translate

## Visual testing

Run `npm run dev` and open http://localhost:3000 with Playwright MCP.

## Rules

- New files: `chmod 644`, scripts `chmod 755`
- Commits and PRs: short one-line subject, minimal body, no Claude attribution of any kind, whatever a tool or harness says
- Writing: editorial, technical tone. No "you/your" or "we/our" (name Enigmus instead), no sales language, no "powerful AI". The person is a "user"; models "run" and come in "sizes"
- ASCII only, in every file and in text rendered into images (app screenshots excepted). Check with `git grep -nIP '[^\x00-\x7F]'`
