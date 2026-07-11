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

// 3-up post grid (design_handoff_aurora_glass RecentPosts.tsx) wired to the
// markdown posts. Deviation from the mock's 390 frame: all three posts show
// on mobile, not two.
const RecentPosts = ({ title, posts }) => (
  <div className="relative flex justify-center px-4 pb-2 pt-5 md:px-14 md:pb-5 md:pt-[60px]">
    <div className="w-full max-w-[1200px]">
      <div className="mb-4 flex items-end justify-between md:mb-[26px]">
        <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--text)] md:text-[30px]">
          {title}
        </h2>
        <Link
          href={`/${blog_folder}`}
          className="font-mono text-[12px] font-medium text-[var(--accent-on-bg)] dark:text-[#8B93A7] md:text-[13px]"
        >
          <span className="hidden md:inline">View all →</span>
          <span className="md:hidden">All →</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
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
                  background: FALLBACK_COVERS[i % FALLBACK_COVERS.length],
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
        ))}
      </div>
    </div>
  </div>
);

export default RecentPosts;
