# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enigmus homepage and blog - a Next.js static site for a privacy-focused AI company. The site promotes local AI processing ("Private AI, Locally") and publishes content about AI privacy.

**Live site**: https://enigmus.cc

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
  - `_index.md` files contain list page metadata
- **Frontmatter**: Supports `title`, `date`, `image`, `categories`, `featured`, `draft`, `layout`
- **Layouts**: Set via `layout` frontmatter field: `default`, `text2image`, `contact`, `404`

### Page Routing
- `pages/[regular].js` - Renders pages from `/content/*.md`, selects layout based on frontmatter
- `pages/posts/[single].js` - Blog post pages from `/content/posts/`
- `pages/categories/[category].js` - Category listing pages

### Key Directories
- `/lib/contentParser.js` - Core content loading: `getListPage()`, `getSinglePage()`, `getRegularPage()`
- `/lib/taxonomyParser.js` - Category/tag extraction
- `/lib/jsonGenerator.js` - Pre-build script generating search JSON
- `/layouts/` - Page layouts and reusable components
- `/config/` - Site configuration (config.json, menu.json, theme.json, social.json)

### Configuration
- `/config/config.json` - Site metadata, pagination (6 posts), widget settings, Disqus config
- `/config/menu.json` - Navigation structure (main/footer menus)
- `/config/theme.json` - Colors and typography
- `next.config.js` - Has `output: 'export'` for static generation

### Styling
- Tailwind CSS with SCSS in `/styles/`
- Dark mode via `next-themes`
- Bootstrap grid compatibility via `tailwind-bootstrap-grid`

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

**New page**: Create `/content/your-page.md` with `layout: text2image` or `layout: contact` in frontmatter.

## Visual Testing

To build and visually test the static site:

1. **Build the static site**:
   ```bash
   npm run build
   ```

2. **Start a local server** to serve the `/out` directory:
   ```bash
   cd /Users/pako/repo/enigmus-homepage/out && python3 -m http.server 3456 &
   ```

3. **Open the site** using Playwright MCP:
   - Use `mcp__playwright__browser_navigate` to navigate to `http://localhost:3456`
   - Use `mcp__playwright__browser_snapshot` to get the page accessibility tree
   - Use `mcp__playwright__browser_take_screenshot` with `fullPage: true` for a visual screenshot

4. **Test other pages** by navigating to paths like:
   - `/download` - Download page
   - `/ai-and-privacy` - AI and Privacy page
   - `/technology` - Technology page
   - `/posts` - Blog listing
   - `/posts/privacy-in-ai-matters` - Individual blog post

5. **Stop the server** when done:
   ```bash
   pkill -f "python3 -m http.server 3456"
   ```

## Git Commits

When creating commits, do NOT include:
- `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
- `Co-Authored-By: Claude ...` lines

Just write clean, descriptive commit messages.

## Writing Style

All content should follow these guidelines:

- **No direct reader address**: Avoid "you/your" constructions. Use neutral third-person or passive voice instead.
  - ❌ "Your data never leaves your device"
  - ✅ "Data never leaves the device"
- **No sales language**: Don't use promotional phrases like "Discover", "Experience", or "Get started today"
- **No first-person company voice**: Avoid "we deliver", "our product". Use the product name instead.
  - ❌ "We deliver powerful AI"
  - ✅ "Enigmus delivers powerful AI"
- **Editorial/informational tone**: Write as if for a technical publication, not marketing copy
- **Keep technical accuracy**: Maintain all factual content, only adjust the voice