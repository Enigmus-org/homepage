import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import { getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import { humanize, slugify } from "@lib/utils/textConverter";
import Link from "next/link";
const { blog_folder } = config.settings;

const Categories = ({ categories }) => {
  return (
    <AuroraBase title={"categories"}>
      <section className="relative px-[22px] pb-16 pt-[34px] text-center md:px-14 md:pb-24 md:pt-[60px]">
        <h1 className="mb-6 font-display text-[34px] font-extrabold tracking-[-0.03em] text-[var(--text)] md:mb-8 md:text-[48px]">
          Categories
        </h1>
        <ul className="mx-auto flex max-w-[700px] flex-wrap justify-center gap-3">
          {categories.map((category, i) => (
            <li key={`category-${i}`}>
              <Link
                href={`/categories/${category.name}`}
                className="inline-flex items-center gap-2.5 rounded-chip border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-[14.5px] capitalize text-[var(--text-muted)] transition hover:-translate-y-0.5 hover:text-[var(--text)]"
              >
                {humanize(category.name)}
                <span className="font-mono text-[12px] font-medium text-[var(--accent-on-bg)]">
                  {category.posts}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AuroraBase>
  );
};

export default Categories;

export const getStaticProps = () => {
  const posts = getSinglePage(`content/${blog_folder}`);
  const categories = getTaxonomy(`content/${blog_folder}`, "categories");
  return {
    props: {
      // getTaxonomy returns slugs, so post values must be slugified to match.
      categories: categories.map((category) => ({
        name: category,
        posts: posts.filter((post) =>
          post.frontmatter.categories.some((c) => slugify(c) === category)
        ).length,
      })),
    },
  };
};
