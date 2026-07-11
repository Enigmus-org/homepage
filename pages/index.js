import config from "@config/config.json";
import Base from "@layouts/Baseof";
import AuroraField from "@layouts/components/aurora/AuroraField";
import AuroraHero from "@layouts/components/aurora/Hero";
import AuroraNav from "@layouts/components/aurora/Nav";
import AuroraRecentPosts from "@layouts/components/aurora/RecentPosts";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { sortByDate } from "@lib/utils/sortFunctions";
const { blog_folder } = config.settings;

const Home = ({ banner, posts, recent_posts }) => {
  return (
    <Base hideHeader>
      {/* Aurora Glass shell — old footer below is replaced in step 6.
          AuroraField clips its own blobs, so no overflow-hidden here — it
          would cut off the nav's mobile sheet */}
      <section className="relative bg-[var(--bg)] pb-8 font-sans text-[var(--text)]">
        <AuroraField />
        <div className="relative z-10">
          <AuroraNav />
          <AuroraHero banner={banner} />
          {recent_posts.enable && (
            <AuroraRecentPosts title={recent_posts.title} posts={posts} />
          )}
        </div>
      </section>
    </Base>
  );
};

export default Home;

// for homepage data
export const getStaticProps = async () => {
  const homepage = await getListPage("content/_index.md");
  const { banner, recent_posts } = homepage.frontmatter;
  const posts = sortByDate(getSinglePage(`content/${blog_folder}`)).slice(0, 3);

  return {
    props: {
      banner,
      posts,
      recent_posts,
    },
  };
};
