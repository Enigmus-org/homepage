<h1 align=center>Enigmus - Private AI, Locally</h1>
<h2 align="center">
<a target="_blank" href="https://enigmus.cc" rel="nofollow">Visit Site</a>
</h2>

<p align=center>
  <a href="https://github.com/vercel/next.js/releases/tag/v16.1.1">
    <img src="https://img.shields.io/static/v1?label=NEXTJS&message=16.1&color=000&logo=nextjs" />
  </a>
  <img src="https://img.shields.io/static/v1?label=LICENSE&message=MIT&color=blue" alt="license">
</p>

![Enigmus](./public/images/enigmus-open-graph.png)

Homepage and blog for Enigmus AI - a privacy-focused AI platform that runs locally on user devices.

## Key Features

- Static site generation with Next.js
- MDX support for rich content
- Dark mode support
- Blog with categories and related posts
- Search functionality
- Responsive design with Tailwind CSS

## Development

**Prerequisites:** Node.js LTS

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Lint code
npm run lint
```

## Build & Deploy

```bash
# Production build
npm run build

# Static export (outputs to /out for GitHub Pages)
npm run export
```

## Project Structure

```
/content/        # Markdown content (pages and blog posts)
/config/         # Site configuration (menu, theme, social)
/pages/          # Next.js routes
/layouts/        # Page layouts and components
/lib/            # Content parsing utilities
/public/         # Static assets
```

## License

Copyright (c) 2024 - Present, Developed by [Enigmus.cc](https://enigmus.cc)

Released under the [MIT](LICENSE) license.
