import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import PostCard from "@layouts/components/aurora/PostCard";
import { getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import { humanize, slugify } from "@lib/utils/textConverter";
import { sortByDate } from "@lib/utils/sortFunctions";
const { blog_folder } = config.settings;

// category page
const Category = ({ postsByCategories, category }) => {
  return (
    <AuroraBase title={humanize(category)}>
      <section className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-16 md:pt-[60px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <p className="text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--accent-on-bg)]">
            Category
          </p>
          <h1 className="mb-8 mt-2 text-center font-display text-[34px] font-extrabold capitalize tracking-[-0.03em] text-[var(--text)] md:mb-12 md:text-[48px]">
            {humanize(category)}
          </h1>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
            {postsByCategories.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>
    </AuroraBase>
  );
};

export default Category;

// category page routes
export const getStaticPaths = () => {
  const allCategories = getTaxonomy(`content/${blog_folder}`, "categories");

  const paths = allCategories.map((category) => ({
    params: {
      category: category,
    },
  }));

  return { paths, fallback: false };
};

// category page data
export const getStaticProps = ({ params }) => {
  const posts = sortByDate(getSinglePage(`content/${blog_folder}`));
  const filterPosts = posts.filter((post) =>
    post.frontmatter.categories.find((category) =>
      slugify(category).includes(params.category)
    )
  );

  return {
    props: {
      postsByCategories: filterPosts,
      category: params.category,
    },
  };
};
