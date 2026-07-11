import NotFound from "@layouts/404";
import AuroraBase from "@layouts/AuroraBase";
import { getRegularPage } from "@lib/contentParser";

const notFound = ({ data }) => {
  return (
    <AuroraBase>
      <NotFound data={data} />
    </AuroraBase>
  );
};

// get 404 page data
export const getStaticProps = async () => {
  const notFoundData = await getRegularPage("404");
  return {
    props: {
      data: notFoundData,
    },
  };
};

export default notFound;
