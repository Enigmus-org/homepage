const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const config = require("../config/config.json");

const { blog_folder, summary_length } = config.settings;
const { site_name, meta_description } = config.metadata;

// Feeds need absolute URLs everywhere, so the trailing slash comes off once
// here and every link is built as `${SITE}/path`.
const SITE = config.site.base_url.replace(/\/$/, "");
const MAX_ITEMS = 20;
const POSTS_DIR = path.join("content", blog_folder);

/* -------------------------------------------------------------- markdown */

// Posts are MDX, not plain markdown: `marked` would pass JSX-flavoured
// attributes through verbatim and feed readers would render them as text.
// Two forms are used in content today and both are translated: the
// `style={{...}}` attribute, and the device-frame shortcodes, which become a
// plain `<img>` of the screenshot they wrap. Anything else capitalised is
// flagged loudly rather than silently shipped as broken markup.
const jsxStyleToCss = (declarations) =>
  // Split on commas that are not inside a quoted value, so a value like
  // '0 auto' or 'rgba(0,0,0,.2)' survives.
  (declarations.match(/(?:[^,']|'[^']*')+/g) || [])
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator === -1) return null;
      const property = declaration
        .slice(0, separator)
        .trim()
        .replace(/['"]/g, "")
        .replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
      const value = declaration
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      return property && value ? `${property}:${value}` : null;
    })
    .filter(Boolean)
    .join(";");

// A device frame is chrome the feed cannot reproduce, so only the screenshot
// inside it travels: the widest variant the component would load, at the width
// the site renders the frame, so a reader sees the same device-scale shot.
const FRAMES = {
  IPhoneFrame: { base: "/images/home-iphone", variant: 1200, width: 280 },
  IPadFrame: { base: "/images/home-ipad", variant: 900, width: 420 },
};

const attribute = (attributes, name) => {
  const match = attributes.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match ? match[1] : null;
};

const framesToImages = (markdown) =>
  markdown.replace(
    /<(IPhoneFrame|IPadFrame)\b([^>]*?)\/>/g,
    (_, name, attributes) => {
      const frame = FRAMES[name];
      const src = attribute(attributes, "src") || frame.base;
      const alt = attribute(attributes, "alt") || "";
      return (
        `<img src="${src}-${frame.variant}.webp" alt="${alt}" ` +
        `style="max-width:${frame.width}px;width:100%;display:block;margin:0 auto" />`
      );
    }
  );

const stripMdx = (markdown, slug) => {
  const withStyles = framesToImages(markdown).replace(
    /style=\{\{([^}]*)\}\}/g,
    (_, declarations) => `style="${jsxStyleToCss(declarations)}"`
  );

  const shortcodes = withStyles.match(/<([A-Z][A-Za-z]*)[\s/>]/g);
  if (shortcodes) {
    const names = [...new Set(shortcodes.map((tag) => tag.slice(1, -1)))];
    console.warn(
      `feed: ${slug} uses MDX shortcode(s) ${names.join(", ")} — feed readers ` +
        `will show them as raw text. Add a plain-HTML equivalent in ` +
        `lib/feedGenerator.js or avoid shortcodes in posts.`
    );
  }

  return withStyles;
};

// Site-relative links and images have to become absolute, and it is cheaper to
// do that on rendered HTML than to intercept every markdown construct.
const absolutize = (html) =>
  html.replace(/(src|href)="\/(?!\/)/g, `$1="${SITE}/`);

const toHtml = (markdown, slug) => absolutize(marked.parse(stripMdx(markdown, slug)));

const BLOCK_BOUNDARY =
  /<br\s*\/?>|<\/(?:p|h[1-6]|li|div|blockquote|pre|tr|td|th|figcaption)>/gi;

const toPlainText = (markdown) =>
  marked
    .parse(markdown)
    // Block ends become spaces so paragraphs do not run together; inline tags
    // are dropped outright, or stripping `<a>` would leave "Core AI , a new…".
    .replace(BLOCK_BOUNDARY, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const summarize = (markdown) => {
  const text = toPlainText(markdown);
  if (text.length <= summary_length) return text;
  return text.slice(0, summary_length).replace(/\s+\S*$/, "") + "…";
};

/* -------------------------------------------------------------------- xml */

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// A `]]>` inside post content would close the section early; split it across
// two sections instead.
const cdata = (value) =>
  `<![CDATA[${String(value).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const mimeType = (file) => {
  const extension = path.extname(file).toLowerCase();
  const types = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".avif": "image/avif",
  };
  return types[extension] || "image/webp";
};

/* ------------------------------------------------------------------ posts */

// Mirrors contentParser's getSinglePage: skip `_`-prefixed files, drafts, and
// anything dated in the future, then newest first.
const readPosts = () => {
  const index = matter(
    fs.readFileSync(path.join(POSTS_DIR, "_index.md"), "utf-8")
  ).data;

  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => {
      const parsed = matter(
        fs.readFileSync(path.join(POSTS_DIR, file), "utf-8")
      );
      return {
        slug: parsed.data.url ? parsed.data.url.replace("/", "") : file.replace(/\.md$/, ""),
        frontmatter: parsed.data,
        content: parsed.content,
      };
    })
    .filter((post) => !post.frontmatter.draft)
    .filter((post) => new Date(post.frontmatter.date || Date.now()) <= new Date())
    .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
    .slice(0, MAX_ITEMS);

  return { index, posts };
};

const buildItem = (post) => {
  const { frontmatter, content, slug } = post;
  const url = `${SITE}/${blog_folder}/${slug}`;
  const cover = frontmatter.image ? `${SITE}${frontmatter.image}` : null;

  // The cover is part of the post's presentation on the site but lives in
  // frontmatter, so it is prepended to the body for readers.
  const body = toHtml(content, slug);
  const html = cover
    ? `<p><img src="${xmlEscape(cover)}" alt="${xmlEscape(
        frontmatter.image_alt || frontmatter.title
      )}" /></p>\n${body}`
    : body;

  return { ...post, url, cover, html, summary: summarize(content) };
};

/* ------------------------------------------------------------------- feeds */

const buildRss = (index, items) => {
  const channelTitle = `${site_name} Blog`;
  const description = index.description || meta_description;
  const lastBuildDate = items.length
    ? new Date(items[0].frontmatter.date).toUTCString()
    : new Date().toUTCString();

  const entries = items
    .map((item) => {
      const categories = (item.frontmatter.categories || [])
        .map((category) => `      <category>${xmlEscape(category)}</category>`)
        .join("\n");

      return [
        "    <item>",
        `      <title>${xmlEscape(item.frontmatter.title)}</title>`,
        `      <link>${xmlEscape(item.url)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(item.url)}</guid>`,
        `      <pubDate>${new Date(item.frontmatter.date).toUTCString()}</pubDate>`,
        `      <description>${xmlEscape(item.summary)}</description>`,
        `      <content:encoded>${cdata(item.html)}</content:encoded>`,
        categories,
        item.cover
          ? `      <media:content url="${xmlEscape(item.cover)}" medium="image" type="${mimeType(
              item.cover
            )}" />`
          : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xmlEscape(channelTitle)}</title>
    <link>${SITE}/${blog_folder}</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>lib/feedGenerator.js</generator>
    <image>
      <url>${SITE}${config.site.logo}</url>
      <title>${xmlEscape(channelTitle)}</title>
      <link>${SITE}/${blog_folder}</link>
    </image>
${entries}
  </channel>
</rss>
`;
};

const buildJsonFeed = (index, items) => ({
  version: "https://jsonfeed.org/version/1.1",
  title: `${site_name} Blog`,
  home_page_url: `${SITE}/${blog_folder}`,
  feed_url: `${SITE}/feed.json`,
  description: index.description || meta_description,
  language: "en-US",
  icon: `${SITE}${config.site.logo}`,
  items: items.map((item) => ({
    id: item.url,
    url: item.url,
    title: item.frontmatter.title,
    summary: item.summary,
    content_html: item.html,
    date_published: new Date(item.frontmatter.date).toISOString(),
    ...(item.cover ? { image: item.cover } : {}),
    ...(item.frontmatter.categories
      ? { tags: item.frontmatter.categories }
      : {}),
  })),
});

/* ------------------------------------------------------------------- write */

try {
  const { index, posts } = readPosts();
  const items = posts.map(buildItem);

  fs.writeFileSync(path.join("public", "feed.xml"), buildRss(index, items));
  fs.writeFileSync(
    path.join("public", "feed.json"),
    JSON.stringify(buildJsonFeed(index, items), null, 2) + "\n"
  );
  console.log(`feed: wrote public/feed.xml and public/feed.json (${items.length} posts)`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
