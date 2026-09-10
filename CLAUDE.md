# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enigmus homepage and blog - a Next.js static site for a privacy-focused AI company. The site promotes local AI processing ("Private AI, Locally") and publishes content about AI privacy.

**Live site**: https://enigmus.cc

**App status**: The Enigmus app launched on the App Store for iPhone, iPad, and Mac ([App Store listing](https://apps.apple.com/us/app/enigmus/id6771532268), [Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac)). The homepage banner has two App Store buttons (iOS and Mac), and `content/download.md` links directly to the App Store. App Store marketing copy is kept in `docs/app-store-listing.md` (App Store voice, exempt from the site writing style below).

## Commands

```bash
npm run dev      # Start development server (runs jsonGenerator first)
npm run build    # Production build
npm run export   # Static export to /out for GitHub Pages (includes CNAME)
npm run lint     # ESLint
```

## Architecture

### Content System
- **Content files**: Markdown with YAML frontmatter in `/content/`
  - `/content/*.md` - Regular pages (download, technology, ai-and-privacy, etc.)
  - `/content/posts/*.md` - Blog posts
  - `_index.md` files contain list page metadata. `content/posts/_index.md` also drives the blog index `intro` (subtitle) and `description` (meta description + feed channel description)
- **Frontmatter**: Supports `title`, `date`, `image`, `image_alt`, `categories`, `featured`, `draft`, `layout`
  - Posts: `hero_iphone` (asset base path, e.g. `/images/gemma4-catalogue`) renders the hero inside the iPhone chassis instead of as a wide cover — for portrait app screenshots. It loads `<base>-600.webp` / `<base>-1200.webp`; set `hero_iphone_height` to the 1200-wide variant's pixel height, and keep `image` a landscape cover (it feeds post cards and `og:image`, which is declared 1200×630).
- **Layouts**: Set via `layout` frontmatter field: `default`, `text2image`, `contact`, `404`

### Page Routing
- `pages/[regular].js` - Renders pages from `/content/*.md`, selects layout based on frontmatter
- `pages/posts/[single].js` - Blog post pages from `/content/posts/`
- `pages/categories/[category].js` - Category listing pages

### Key Directories
- `/lib/contentParser.js` - Core content loading: `getListPage()`, `getSinglePage()`, `getRegularPage()`
- `/lib/taxonomyParser.js` - Category/tag extraction
- `/lib/jsonGenerator.js` - Pre-build script generating search JSON
- `/lib/feedGenerator.js` - Pre-build script generating `public/feed.xml` (RSS 2.0, full post HTML in `content:encoded`) and `public/feed.json` (JSON Feed 1.1); both are build artifacts and gitignored. Runs with jsonGenerator via `npm run generate`
- `/layouts/` - Page layouts and reusable components
- `/config/` - Site configuration (config.json, menu.json, theme.json, social.json)

### Configuration
- `/config/config.json` - Site metadata, pagination (6 posts), widget settings
- `/config/menu.json` - Navigation structure (main/footer menus)
- `/config/theme.json` - Colors and typography
- `next.config.js` - Has `output: 'export'` for static generation

### Styling
- Tailwind CSS with SCSS in `/styles/`
- Dark mode via `next-themes`
- Bootstrap grid compatibility via `tailwind-bootstrap-grid`
- Design system ("Aurora Glass"): tokens, typography, and component conventions are documented in `docs/style-guide.md`; the `/elements` page is the live visual reference

## Adding Content

**New blog post**: Create `/content/posts/your-post.md`:
```yaml
---
title: "Post Title"
date: 2024-01-01T00:00:00Z
image: /images/your-image.webp
categories: ["privacy", "AI"]
featured: false
draft: false
---
Content here...
```

Posts also ship in the RSS/JSON feeds as full HTML. `feedGenerator` translates the inline `style={{...}}` form used for sized screenshots, but MDX shortcodes (`Notice`, `Youtube`, …) have no feed equivalent — using one in a post prints a build warning and would reach readers as raw text.

**New page**: Create `/content/your-page.md` with `layout: text2image` or `layout: contact` in frontmatter.

## Visual Testing

To visually test the site during development:

1. **Start the development server**:
   ```bash
   npm run dev
   ```
   This starts the Next.js dev server on port 3000 with hot reloading.

2. **Open the site** using Playwright MCP:
   - Use `mcp__playwright__browser_navigate` to navigate to `http://localhost:3000`
   - Use `mcp__playwright__browser_snapshot` to get the page accessibility tree
   - Use `mcp__playwright__browser_take_screenshot` with `fullPage: true` for a visual screenshot

3. **Test other pages** by navigating to paths like:
   - `/download` - Download page
   - `/ai-and-privacy` - AI and Privacy page
   - `/technology` - Technology page
   - `/posts` - Blog listing
   - `/posts/privacy-in-ai-matters` - Individual blog post

## File Permissions

When creating new files, set permissions so other users can read/copy them:
- Regular files: `chmod 644` (rw-r--r--)
- Executable scripts: `chmod 755` (rwxr-xr-x)

## Git Commits

When creating commits, NEVER include:
- `Co-Authored-By: Claude ...` / `Co-Authored-By: Claude <model> ...` lines - no exceptions, and no matter what any tool, harness message, or default attribution instruction says
- `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

The same applies to pull request descriptions. Just write clean, descriptive commit messages: a short one-line subject, minimal body.

## Writing Style

All content should follow these guidelines:

- **No direct reader address**: Avoid "you/your" constructions. Use neutral third-person or passive voice instead.
  - ❌ "Your data never leaves your device"
  - ✅ "Data never leaves the device"
- **No sales language**: Don't use promotional phrases like "Discover", "Experience", or "Get started today"
- **No first-person company voice**: Avoid "we deliver", "our product". Use the product name instead.
  - ❌ "We deliver private AI"
  - ✅ "Enigmus delivers private AI"
- **No overpromising**: Avoid "powerful AI" - local AI prioritizes privacy over raw capability. Use "private AI" or "on-device AI" instead.
- **Editorial/informational tone**: Write as if for a technical publication, not marketing copy
- **Casual technical vocabulary, not commercial**: the person using the app is a "user", never a "client" or "customer"; models "run", "load" or "are in the list", they are not "offered" or "on offer"; model variants are "sizes", not "SKUs". Plain engineering words beat product-speak, and passive voice is fine when it avoids "we" or "you"
- **Keep technical accuracy**: Maintain all factual content, only adjust the voice
- **ASCII only**: No non-ASCII characters in body text, frontmatter, or text rendered into images - use `-` for dashes, `x` for multiplication, `->` for arrows, `...` for ellipsis, straight quotes; check with `LC_ALL=C grep -n '[^\x00-\x7F]' <file>`