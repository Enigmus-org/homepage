import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import AuroraHero from "@layouts/components/aurora/Hero";
import AuroraRecentPosts from "@layouts/components/aurora/RecentPosts";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { sortByDate } from "@lib/utils/sortFunctions";
const { blog_folder } = config.settings;

const Home = ({ banner, posts, recent_posts }) => {
  return (
    <AuroraBase>
      <AuroraHero banner={banner} />
      {recent_posts.enable && (
        <AuroraRecentPosts title={recent_posts.title} posts={posts} />
      )}
    </AuroraBase>
  );
};

export default Home;

// for homepage data
export const getStaticProps = async () => {
  const homepage = await getListPage("content/_index.md");
  const { banner, recent_posts } = homepage.frontmatter;
  const posts = sortByDate(getSinglePage(`content/${blog_folder}`)).slice(0, 6);

  return {
    props: {
      banner,
      posts,
      recent_posts,
    },
  };
};
