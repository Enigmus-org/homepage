import config from "@config/config.json";
import ImageFallback from "@layouts/components/ImageFallback";
import dateFormat from "@lib/utils/dateFormat";
import { plainify } from "@lib/utils/textConverter";
import Link from "next/link";

const { blog_folder } = config.settings;

// Gradient covers from the mock, used when a post has no image
const FALLBACK_COVERS = [
  "linear-gradient(135deg,#0D6FD1,#1FA3FB 60%,#6D5EF5)",
  "linear-gradient(135deg,#123A63,#1FA3FB)",
  "linear-gradient(135deg,#3A2E7A,#6D5EF5 70%,#1FA3FB)",
];

const excerpt = (content) => {
  const text = plainify(content);
  if (text.length <= 95) return text;
  return text.slice(0, 95).replace(/\s+\S*$/, "") + " …";
};

// Aurora glass post card (cover, category chips, title, excerpt, date).
// `index` rotates the gradient fallback cover.
const PostCard = ({ post, index = 0 }) => (
  <Link
    href={`/${blog_folder}/${post.slug}`}
    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] [box-shadow:var(--shadow-card)] transition-transform hover:-translate-y-1 md:rounded-[18px]"
  >
    {post.frontmatter.image ? (
      <ImageFallback
        className="h-[130px] w-full object-cover md:h-[150px]"
        src={post.frontmatter.image}
        alt={post.frontmatter.title}
        width={405}
        height={150}
      />
    ) : (
      <div
        className="h-[130px] md:h-[150px]"
        style={{
          background: FALLBACK_COVERS[index % FALLBACK_COVERS.length],
        }}
      />
    )}
    <div className="p-4 md:p-5">
      <div className="mb-2.5 flex flex-wrap gap-[7px] md:mb-3 md:gap-2">
        {(post.frontmatter.categories || []).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-brand/[0.14] px-2 py-1 font-mono text-[10.5px] font-medium text-[var(--accent-on-bg)] md:px-[9px] md:py-[5px] md:text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mb-2 font-heading text-[16px] font-semibold leading-[1.32] text-[var(--text)] dark:text-white md:mb-2.5 md:text-[17px] md:leading-[1.3]">
        {post.frontmatter.title}
      </h3>
      <p className="mb-3 text-[13.5px] leading-[1.55] text-[var(--text-dim)] md:mb-3.5">
        {excerpt(post.content)}
      </p>
      <div className="font-mono text-[12px] text-[var(--text-faint)]">
        {dateFormat(post.frontmatter.date)}
      </div>
    </div>
  </Link>
);

export default PostCard;
