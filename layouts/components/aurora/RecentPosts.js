import config from "@config/config.json";
import Link from "next/link";
import PostCard from "./PostCard";

const { blog_folder } = config.settings;

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
          <PostCard key={post.slug} post={post} index={i} />
        ))}
      </div>
    </div>
  </div>
);

export default RecentPosts;
