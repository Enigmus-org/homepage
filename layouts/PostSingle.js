import config from "@config/config.json";
import AuroraBase from "@layouts/AuroraBase";
import PostCard from "@layouts/components/aurora/PostCard";
import dateFormat from "@lib/utils/dateFormat";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import shortcodes from "./shortcodes/all";
const { meta_author } = config.metadata;

const PostSingle = ({
  frontmatter,
  content,
  mdxContent,
  slug,
  relatedPosts,
}) => {
  let { description, title, date, image, categories } = frontmatter;
  description = description ? description : content.slice(0, 120);
  const related = relatedPosts.filter((post) => post.slug !== slug);

  return (
    <AuroraBase title={title} description={description} image={image}>
      <article className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-14 md:pt-[60px]">
        <div className="mx-auto max-w-[760px]">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {categories.map((tag) => (
              <Link
                key={tag}
                href={`/categories/${tag.replace(" ", "-")}`}
                className="rounded-md bg-brand/[0.14] px-[9px] py-[5px] font-mono text-[11px] font-medium text-[var(--accent-on-bg)]"
              >
                {tag}
              </Link>
            ))}
          </div>
          <h1 className="mb-4 text-center font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--text)] md:text-[44px] md:leading-[1.05]">
            {title}
          </h1>
          <div className="mb-8 text-center font-mono text-[12.5px] text-[var(--text-faint)] md:mb-10">
            {meta_author} · {dateFormat(date)}
          </div>
          {image && (
            <Image
              src={image}
              height="500"
              width="1000"
              alt={title}
              className="mb-8 rounded-[18px] border border-[var(--border)] md:mb-10"
            />
          )}
          <div className="aurora-content">
            <MDXRemote {...mdxContent} components={shortcodes} />
          </div>
        </div>

        {/* related posts */}
        {related.length > 0 && (
          <div className="mx-auto mt-14 w-full max-w-[1200px] md:mt-20">
            <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--text)] md:mb-[26px] md:text-[28px]">
              Related posts
            </h2>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
              {related.slice(0, 3).map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          </div>
        )}
      </article>
    </AuroraBase>
  );
};

export default PostSingle;
