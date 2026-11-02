import config from "@config/config.json";
import dateFormat from "@lib/utils/dateFormat";
import { plainify } from "@lib/utils/textConverter";
import Link from "next/link";

const { blog_folder } = config.settings;

const excerpt = (content, max = 150) => {
  const text = plainify(content);
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "...";
};

// Dated post list, one hairline-separated row per post: date, title and
// categories. `withExcerpt` adds the opening of each post under its title
// (needs the post `content`). Used by the homepage, blog index, category
// and search pages, and a post's related posts.
const PostList = ({ posts, withExcerpt = false, className = "" }) => (
  <ul className={`border-t border-[var(--border)] ${className}`}>
    {posts.map(({ slug, frontmatter: post, content }) => (
      <li key={slug} className="border-b border-[var(--border)]">
        <Link
          href={`/${blog_folder}/${slug}`}
          className="group grid gap-1 py-4 md:grid-cols-[120px_1fr_auto] md:items-baseline md:gap-6"
        >
          <span className="font-mono text-[12.5px] text-[var(--text-faint)]">
            {dateFormat(post.date)}
          </span>
          <span>
            <span className="block text-[15px] font-medium text-[var(--text)] group-hover:text-[var(--accent-on-bg)]">
              {post.title}
            </span>
            {withExcerpt && (
              <span className="mt-1 block text-[13.5px] leading-[1.55] text-[var(--text-dim)]">
                {excerpt(content)}
              </span>
            )}
          </span>
          <span className="hidden gap-1.5 md:flex">
            {(post.categories || []).map((tag) => (
              <span
                key={tag}
                className="whitespace-nowrap rounded-md border border-[var(--border)] px-[7px] py-0.5 text-[11px] text-[var(--text-faint)]"
              >
                {tag}
              </span>
            ))}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

export default PostList;
