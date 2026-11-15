import config from "@config/config.json";
import dateFormat from "@lib/utils/dateFormat";
import Link from "next/link";
import { IPhoneFrame } from "./DeviceFrames";
import PostList, { excerpt } from "./PostList";
import SubscribeFeed from "./SubscribeFeed";

const { blog_folder } = config.settings;

// The newest post as a card over the list, on the nav and hero's blue wash:
// date, title, the post's opening and its tags, plus the post's `hero_iphone`
// screenshot in a small iPhone frame when it has one. Posts without one get
// the same card, text only.
const LeadPost = ({ slug, frontmatter: post, content }) => (
  <Link
    href={`/${blog_folder}/${slug}`}
    className="group mb-6 flex items-center justify-between gap-5 rounded-[14px] border border-[var(--brand-line)] bg-[var(--brand-wash)] px-5 py-5 transition-colors hover:border-brand/50 md:gap-8 md:px-7 md:py-6"
  >
    <span className="block min-w-0 max-w-[720px] flex-1">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--accent-on-bg)]">
          Latest
        </span>
        <span className="font-mono text-[12.5px] text-[var(--text-faint)]">
          {dateFormat(post.date)}
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
      </span>
      <span className="mt-2.5 block text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--text)] group-hover:text-[var(--accent-on-bg)] md:text-[21px]">
        {post.title}
      </span>
      <span className="mt-2 line-clamp-4 text-[14px] leading-[1.6] text-[var(--text-dim)] md:line-clamp-3">
        {excerpt(content, 260)}
      </span>
      <span className="mt-3.5 block text-[13px] font-medium text-[var(--accent-on-bg)]">
        Read -&gt;
      </span>
    </span>
    {post.hero_iphone && (
      <IPhoneFrame
        src={post.hero_iphone}
        height={post.hero_iphone_height}
        alt=""
        dark={false}
        sizes="(min-width: 768px) 96px, 72px"
        className="w-[72px] shrink-0 md:mr-2 md:w-[96px]"
      />
    )}
  </Link>
);

// Homepage recent posts: the newest as a lead card, the rest as the dated
// list, closed by the feed panel. pages/index.js passes the six most recent.
const RecentPosts = ({ title, posts }) => {
  const [lead, ...rest] = posts;
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-14 md:px-8 md:py-20">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[20px] font-semibold tracking-[-0.01em]">{title}</h2>
        <Link
          href={`/${blog_folder}`}
          className="text-[13px] text-[var(--text-faint)] hover:text-[var(--text)]"
        >
          All posts -&gt;
        </Link>
      </div>
      {lead && <LeadPost {...lead} />}
      <PostList posts={rest} />
      <SubscribeFeed className="mt-10" />
    </section>
  );
};

export default RecentPosts;
