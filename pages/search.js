import AuroraBase from "@layouts/AuroraBase";
import PostCard from "@layouts/components/aurora/PostCard";
import { slugify } from "@lib/utils/textConverter";
import { useSearchContext } from "context/state";
import { useRouter } from "next/router";

const SearchPage = () => {
  const router = useRouter();
  const { query } = router;
  const keyword = slugify(query.key);
  const { posts } = useSearchContext();

  const searchResults = posts.filter((product) => {
    if (product.frontmatter.draft) {
      return !product.frontmatter.draft;
    }
    if (slugify(product.frontmatter.title).includes(keyword)) {
      return product;
    } else if (
      product.frontmatter.categories.find((category) =>
        slugify(category).includes(keyword)
      )
    ) {
      return product;
    } else if (slugify(product.content).includes(keyword)) {
      return product;
    }
  });

  return (
    <AuroraBase title={`Search results for ${query.key}`}>
      <section className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-16 md:pt-[60px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="mb-8 text-center font-display text-[30px] font-extrabold tracking-[-0.03em] text-[var(--text)] md:mb-12 md:text-[42px]">
            Search results for{" "}
            <span className="text-brand-deep dark:text-brand">
              {query.key}
            </span>
          </h1>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
              {searchResults.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--surface-solid)] p-10 text-center text-[15.5px] text-[var(--text-muted)] [box-shadow:var(--shadow-card)]">
              No results found
            </div>
          )}
        </div>
      </section>
    </AuroraBase>
  );
};

export default SearchPage;
