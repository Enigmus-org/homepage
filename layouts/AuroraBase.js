import Base from "@layouts/Baseof";
import AuroraField from "@layouts/components/aurora/AuroraField";
import AuroraFooter from "@layouts/components/aurora/Footer";
import AuroraNav from "@layouts/components/aurora/Nav";

// Aurora Glass page shell: Baseof's SEO head without the old chrome, plus the
// aurora background, glass nav, and footer. AuroraField clips its own blobs,
// so no overflow-hidden here — it would cut off the nav's mobile sheet.
const AuroraBase = ({ children, ...seo }) => (
  <Base hideHeader hideFooter {...seo}>
    <section className="relative bg-[var(--bg)] font-sans text-[var(--text)]">
      <AuroraField />
      <div className="relative z-10">
        <AuroraNav />
        {children}
        <AuroraFooter />
      </div>
    </section>
  </Base>
);

export default AuroraBase;
