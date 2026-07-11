import NotFound from "@layouts/404";
import AuroraArticle from "@layouts/AuroraArticle";
import AuroraBase from "@layouts/AuroraBase";
import AuroraContact from "@layouts/AuroraContact";
import AuroraDownload from "@layouts/AuroraDownload";
import { getRegularPage, getSinglePage } from "@lib/contentParser";

const layouts = {
  "aurora-download": AuroraDownload,
  "aurora-contact": AuroraContact,
  404: NotFound,
};

// for all regular pages — aurora-article is the default layout
const RegularPages = ({ data }) => {
  const { title, meta_title, description, noindex, canonical, layout } =
    data.frontmatter;
  const { content } = data;
  const Layout = layouts[layout] || AuroraArticle;

  return (
    <AuroraBase
      title={title}
      description={description ? description : content.slice(0, 120)}
      meta_title={meta_title}
      noindex={noindex}
      canonical={canonical}
    >
      <Layout data={data} />
    </AuroraBase>
  );
};
export default RegularPages;

// for regular page routes
export const getStaticPaths = async () => {
  const slugs = getSinglePage("content");
  const paths = slugs.map((item) => ({
    params: {
      regular: item.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

// for regular page data
export const getStaticProps = async ({ params }) => {
  const { regular } = params;
  const allPages = await getRegularPage(regular);
  return {
    props: {
      slug: regular,
      data: allPages,
    },
  };
};
