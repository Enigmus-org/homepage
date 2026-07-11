import Link from "next/link";

// Glass pagination for aurora blog listings. Page 1 is /posts; later pages
// live at /page/N (existing route scheme).
const pageHref = (page) => (page === 1 ? "/posts" : `/page/${page}`);

const btnBase =
  "inline-flex h-9 min-w-[36px] items-center justify-center rounded-[10px] border px-2.5 font-mono text-[13px]";
const btnGlass = `${btnBase} border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]`;

const Pagination = ({ currentPage, totalPages }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex justify-center gap-2 md:mt-12"
    >
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          aria-label="Previous page"
          className={btnGlass}
        >
          ←
        </Link>
      )}
      {pages.map((page) =>
        page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className={`${btnBase} border-transparent bg-brand-btn font-semibold text-white`}
          >
            {page}
          </span>
        ) : (
          <Link key={page} href={pageHref(page)} className={btnGlass}>
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          aria-label="Next page"
          className={btnGlass}
        >
          →
        </Link>
      )}
    </nav>
  );
};

export default Pagination;
