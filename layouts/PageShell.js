import Base from "@layouts/Baseof";
import Footer from "@layouts/components/site/Footer";
import Nav from "@layouts/components/site/Nav";

// Page shell: Baseof's SEO head without the old chrome, plus the nav and
// footer on the flat page background.
const PageShell = ({ children, ...seo }) => (
  <Base {...seo}>
    <section className="bg-[var(--bg)] font-sans text-[var(--text)]">
      <Nav />
      {children}
      <Footer />
    </section>
  </Base>
);

export default PageShell;
