import NotFound from "@layouts/404";
import AuroraArticle from "@layouts/AuroraArticle";
import AuroraBase from "@layouts/AuroraBase";
import AuroraDownload from "@layouts/AuroraDownload";
import Text2Image from "@layouts/Text2Image";
import Base from "@layouts/Baseof";
import Contact from "@layouts/Contact";
import Default from "@layouts/Default";
import { getRegularPage, getSinglePage } from "@lib/contentParser";

// for all regular pages
const RegularPages = ({ data }) => {
  const { title, meta_title, description, image, noindex, canonical, layout } =
    data.frontmatter;
  const { content } = data;

  // Aurora-redesigned pages use the aurora shell instead of the old chrome
  if (layout === "aurora-download" || layout === "aurora-article") {
    return (
      <AuroraBase
        title={title}
        description={description ? description : content.slice(0, 120)}
        meta_title={meta_title}
        noindex={noindex}
        canonical={canonical}
      >
        {layout === "aurora-download" ? (
          <AuroraDownload data={data} />
        ) : (
          <AuroraArticle data={data} />
        )}
      </AuroraBase>
    );
  }

  return (
    <Base
      title={title}
      description={description ? description : content.slice(0, 120)}
      meta_title={meta_title}
      image={image}
      noindex={noindex}
      canonical={canonical}
    >
      {layout === "404" ? (
        <NotFound data={data} />
      ) : layout === "text2image" ? (
        <Text2Image data={data} />
      ) : layout === "contact" ? (
        <Contact data={data} />
      ) : (
        <Default data={data} />
      )}
    </Base>
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
