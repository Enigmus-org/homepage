import config from "@config/config.json";
import PageShell from "@layouts/PageShell";
import DeviceShowcase from "@layouts/components/site/DeviceShowcase";
import Features from "@layouts/components/site/Features";
import Hero from "@layouts/components/site/Hero";
import LLMServer from "@layouts/components/site/LLMServer";
import RecentPosts from "@layouts/components/site/RecentPosts";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { sortByDate } from "@lib/utils/sortFunctions";
const { blog_folder } = config.settings;

const Home = ({ banner, posts, recent_posts }) => {
  return (
    <PageShell>
      <Hero banner={banner} />
      <Features />
      <DeviceShowcase />
      <LLMServer />
      {recent_posts.enable && (
        <RecentPosts title={recent_posts.title} posts={posts} />
      )}
    </PageShell>
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
