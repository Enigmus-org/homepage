import Base from "@layouts/Baseof";
import AuroraFooter from "@layouts/components/aurora/Footer";
import AuroraNav from "@layouts/components/aurora/Nav";

// Page shell: Baseof's SEO head without the old chrome, plus the nav and
// footer on the flat page background.
const AuroraBase = ({ children, ...seo }) => (
  <Base {...seo}>
    <section className="bg-[var(--bg)] font-sans text-[var(--text)]">
      <AuroraNav />
      {children}
      <AuroraFooter />
    </section>
  </Base>
);

export default AuroraBase;
