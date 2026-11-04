import PageShell from "@layouts/PageShell";
import PostList from "@layouts/components/site/PostList";
import { slugify } from "@lib/utils/textConverter";
import { useSearchContext } from "context/state";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SearchPage = () => {
  const router = useRouter();
  const { posts } = useSearchContext();
  const [input, setInput] = useState("");

  // pre-fill from ?key= links
  useEffect(() => {
    if (router.isReady && router.query.key) setInput(router.query.key);
  }, [router.isReady, router.query.key]);

  const keyword = slugify(input.trim());

  const searchResults = keyword
    ? posts.filter((product) => {
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
      })
    : [];

  return (
    <PageShell title="Search">
      <section className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-16 md:pt-[60px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="mb-6 text-center text-[34px] font-semibold tracking-[-0.01em] text-[var(--text)] md:mb-8 md:text-[48px]">
            Search
          </h1>
          <div className="mb-8 flex justify-center md:mb-12">
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search posts by title, category, or content"
              aria-label="Search posts"
              className="w-full max-w-md rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-[15px] leading-6 text-[var(--text)] backdrop-blur-md placeholder:text-[var(--text-faint)] focus:border-brand/60 focus:outline-none"
            />
          </div>
          {searchResults.length > 0 ? (
            <PostList posts={searchResults} withExcerpt />
          ) : (
            keyword && (
              <div className="mx-auto max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[15.5px] text-[var(--text-muted)] [box-shadow:var(--shadow-card)]">
                No results found
              </div>
            )
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default SearchPage;
