import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import AuroraPagination from "@layouts/components/aurora/Pagination";
import PostCard from "@layouts/components/aurora/PostCard";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { sortByDate } from "@lib/utils/sortFunctions";
const { blog_folder } = config.settings;

// blog pagination
const BlogPagination = ({ postIndex, posts, currentPage, pagination }) => {
  const indexOfLastPost = currentPage * pagination;
  const indexOfFirstPost = indexOfLastPost - pagination;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const { title } = postIndex.frontmatter;
  const totalPages = Math.ceil(posts.length / pagination);

  return (
    <AuroraBase title={title}>
      <section className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-16 md:pt-[60px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="mb-8 text-center font-display text-[34px] font-extrabold tracking-[-0.03em] text-[var(--text)] md:mb-12 md:text-[48px]">
            {title}
          </h1>
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

  return {
    props: {
      pagination: pagination,
      posts: posts,
      currentPage: currentPage,
      postIndex: postIndex,
    },
  };
};
