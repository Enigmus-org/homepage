import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import AuroraPagination from "@layouts/components/aurora/Pagination";
import PostCard from "@layouts/components/aurora/PostCard";
import SubscribeFeed from "@layouts/components/aurora/SubscribeFeed";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { sortByDate } from "@lib/utils/sortFunctions";
import { slugify } from "@lib/utils/textConverter";
import Link from "next/link";
const { blog_folder } = config.settings;

// blog pagination
const BlogPagination = ({
  postIndex,
  posts,
  currentPage,
  pagination,
  categories,
}) => {
  const indexOfLastPost = currentPage * pagination;
  const indexOfFirstPost = indexOfLastPost - pagination;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const { title, intro, description } = postIndex.frontmatter;
  const totalPages = Math.ceil(posts.length / pagination);
  // Intro, subscribe strip, and category chips belong to the canonical first
  // page only — repeated on /page/2+ they would dilute it.
  const isFirstPage = currentPage === 1;

  return (
    <AuroraBase title={title} description={description}>
      <section className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-16 md:pt-[60px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="mb-4 text-center font-display text-[34px] font-extrabold tracking-[-0.03em] text-[var(--text)] md:mb-5 md:text-[48px]">
            {title}
          </h1>

          {isFirstPage && intro && (
            <p className="mx-auto mb-7 max-w-[620px] text-center text-[15.5px] leading-[1.6] text-[var(--text-muted)] md:mb-9 md:text-[17.5px]">
              {intro}
            </p>
          )}

          {isFirstPage && <SubscribeFeed className="mb-8 md:mb-10" />}

          {isFirstPage && categories.length > 0 && (
            <nav
              aria-label="Post categories"
              className="mb-7 flex flex-wrap justify-center gap-2.5 md:mb-9"
            >
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="rounded-chip border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] capitalize text-[var(--text-muted)] transition hover:-translate-y-0.5 hover:text-[var(--text)]"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
            {currentPosts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
          <AuroraPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </section>
    </AuroraBase>
  );
};

export default BlogPagination;

// get blog pagination slug
export const getStaticPaths = () => {
  const getAllSlug = getSinglePage(`content/${blog_folder}`);
  const allSlug = getAllSlug.map((item) => item.slug);
  const { pagination } = config.settings;
  const totalPages = Math.ceil(allSlug.length / pagination);
  let paths = [];

  for (let i = 1; i < totalPages; i++) {
    paths.push({
      params: {
        slug: (i + 1).toString(),
      },
    });
  }

  return {
    paths,
    fallback: false,
  };
};

// get blog pagination content
export const getStaticProps = async ({ params }) => {
  const currentPage = parseInt((params && params.slug) || 1);
  const { pagination } = config.settings;
  const posts = sortByDate(getSinglePage(`content/${blog_folder}`));
  const postIndex = await getListPage(`content/${blog_folder}/_index.md`);

  // getTaxonomy returns slugs, and humanizing those mangles acronyms ("MLX"
  // becomes "Mlx"), so the chips carry the label as written in frontmatter,
  // deduped by the slug its category page is keyed on.
  const categories = [];
  const seen = new Set();
  for (const post of posts) {
    for (const name of post.frontmatter.categories || []) {
      const slug = slugify(name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      categories.push({ name, slug });
    }
  }

  return {
    props: {
      pagination: pagination,
      posts: posts,
      currentPage: currentPage,
      // Only the frontmatter is read here, so the parsed _index.md body is
      // dropped rather than shipped to the client with the page props.
      postIndex: { frontmatter: postIndex.frontmatter },
      categories: categories,
    },
  };
};
