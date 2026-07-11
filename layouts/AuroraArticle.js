import shortcodes from "@shortcodes/all";
import { MDXRemote } from "next-mdx-remote";

// Aurora long-form content page: display heading (optional brand-blue
// accent) and intro from frontmatter, then the markdown body styled by the
// .aurora-content typography layer (styles/aurora.scss). Rendered inside
// AuroraBase by pages/[regular].js.
const AuroraArticle = ({ data }) => {
  const { heading = data.frontmatter.title, heading_accent, intro } =
    data.frontmatter;
  return (
    <section className="relative px-[22px] pb-10 pt-[34px] md:px-14 md:pb-16 md:pt-[70px]">
      <div className="mx-auto max-w-[760px]">
        <h1 className="mb-4 text-center font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--text)] md:mb-5 md:text-[52px] md:leading-[1.02]">
          {heading}{" "}
          {heading_accent && (
            <span className="text-brand-deep dark:text-brand">
              {heading_accent}
            </span>
          )}
        </h1>
        {intro && (
          <p className="mx-auto max-w-[620px] text-center text-[15.5px] leading-[1.6] text-[var(--text-muted)] md:text-[17.5px]">
            {intro}
          </p>
        )}
        <div className="aurora-content mt-8 md:mt-12">
          <MDXRemote {...data.mdxContent} components={shortcodes} />
        </div>
      </div>
    </section>
  );
};

export default AuroraArticle;
