import config from "@config/config.json";
import Link from "next/link";
import PostList from "./PostList";
import SubscribeFeed from "./SubscribeFeed";

const { blog_folder } = config.settings;

// Homepage recent posts: the dated list, closed by the feed panel.
// pages/index.js passes the six most recent.
const RecentPosts = ({ title, posts }) => (
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
    <PostList posts={posts} />
    <SubscribeFeed className="mt-10" />
  </section>
);

export default RecentPosts;
