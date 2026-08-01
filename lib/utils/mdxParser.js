import { serialize } from "next-mdx-remote/serialize";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypeShellTokens from "./rehypeShellTokens";

// mdx content parser
const parseMDX = async (content) => {
  const options = {
    mdxOptions: {
      // Syntax highlighting runs here rather than in the browser: the site is
      // a static export, so fenced blocks ship as pre-classed markup with no
      // highlighter bundle. `detect: false` leaves fences without a language
      // unhighlighted instead of guessing at one.
      rehypePlugins: [
        rehypeSlug,
        [rehypeHighlight, { detect: false, ignoreMissing: true }],
        rehypeShellTokens,
      ],
      remarkPlugins: [remarkGfm],
    },
  };
  return await serialize(content, options);
};

export default parseMDX;
