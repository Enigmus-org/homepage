import { markdownify } from "@lib/utils/textConverter";
import Link from "next/link";

const NotFound = ({ data }) => {
  const { content } = data;

  return (
    <section className="relative flex min-h-[55vh] items-center justify-center px-[22px] py-16 text-center md:px-14">
      <div>
        <h1 className="mb-2 font-display text-[72px] font-extrabold leading-none tracking-[-0.04em] text-brand-deep dark:text-brand md:text-[104px]">
          404
        </h1>
        {markdownify(content, "div", "aurora-content")}
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-[11px] bg-brand-btn px-[18px] py-[11px] text-[14px] font-semibold text-white shadow-[0_6px_20px_rgba(31,163,251,0.4)] transition-transform hover:-translate-y-px"
        >
          Back to the homepage
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
