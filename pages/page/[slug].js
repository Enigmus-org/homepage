import config from "@config/config.json";
import PageShell from "@layouts/PageShell";
import Pagination from "@layouts/components/site/Pagination";
import PostList from "@layouts/components/site/PostList";
import SubscribeFeed from "@layouts/components/site/SubscribeFeed";
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
    <PageShell title={title} description={description}>
      <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] md:text-[44px]">
          {title}
        </h1>

        {isFirstPage && intro && (
          <p className="mt-3 max-w-[640px] text-[16px] leading-[1.65] text-[var(--text-muted)]">
            {intro}
          </p>
        )}

        {isFirstPage && <SubscribeFeed className="mt-8 md:mx-0" />}

        {isFirstPage && categories.length > 0 && (
          <nav aria-label="Post categories" className="mt-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[13px] capitalize text-[var(--text-dim)] transition-colors hover:border-[var(--text-faint)] hover:text-[var(--text)]"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}

        <PostList posts={currentPosts} withExcerpt className="mt-6" />
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </section>
    </PageShell>
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
