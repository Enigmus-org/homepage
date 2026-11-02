import NotFound from "@layouts/404";
import ArticleLayout from "@layouts/ArticleLayout";
import ContactLayout from "@layouts/ContactLayout";
import DownloadLayout from "@layouts/DownloadLayout";
import PageShell from "@layouts/PageShell";
import { getRegularPage, getSinglePage } from "@lib/contentParser";

const layouts = {
  download: DownloadLayout,
  contact: ContactLayout,
  404: NotFound,
};

// for all regular pages - ArticleLayout is the default layout
const RegularPages = ({ data }) => {
  const { title, meta_title, description, noindex, canonical, layout } =
    data.frontmatter;
  const { content } = data;
  const Layout = layouts[layout] || ArticleLayout;

  return (
    <PageShell
      title={title}
      description={description ? description : content.slice(0, 120)}
      meta_title={meta_title}
      noindex={noindex}
      canonical={canonical}
    >
      <Layout data={data} />
    </PageShell>
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
