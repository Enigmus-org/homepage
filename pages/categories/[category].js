import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import PostList from "@layouts/components/aurora/PostList";
import { getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import { humanize, slugify } from "@lib/utils/textConverter";
import { sortByDate } from "@lib/utils/sortFunctions";
const { blog_folder } = config.settings;

// category page
const Category = ({ postsByCategories, name }) => {
  return (
    <AuroraBase title={name}>
      <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--accent-on-bg)]">
          Category
        </p>
        <h1 className="mt-2 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] md:text-[44px]">
          {name}
        </h1>
        <PostList posts={postsByCategories} withExcerpt className="mt-8" />
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
  // Exact slug match: a substring test put "Core AI" posts under "ai".
  const filterPosts = posts.filter((post) =>
    post.frontmatter.categories.some(
      (category) => slugify(category) === params.category
    )
  );

  // The label as written in frontmatter, first letter raised: humanizing
  // the slug mangles acronyms ("mlx" -> "Mlx").
  const label =
    posts
      .flatMap((post) => post.frontmatter.categories)
      .find((category) => slugify(category) === params.category) ||
    humanize(params.category);
  const name = label[0].toUpperCase() + label.slice(1);

  return {
    props: {
      postsByCategories: filterPosts,
      name,
    },
  };
};
