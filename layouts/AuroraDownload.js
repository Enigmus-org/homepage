import useOs from "@hooks/useOs";
import AppStoreButton from "@layouts/components/aurora/AppStoreButton";
import IPadFrame from "@layouts/components/aurora/IPadFrame";

// Aurora download page: headline + intro from frontmatter, then one glass
// card per platform with its store button and requirements list, and an
// iPad device frame showing the app. Rendered inside AuroraBase by
// pages/[regular].js. On macOS the Mac store button takes the primary style.
const AuroraDownload = ({ data }) => {
  const { heading, heading_accent, intro, platforms } = data.frontmatter;
  const isMac = useOs();
  const macIndex = platforms.findIndex((p) => /mac/i.test(p.store));
  const primaryIndex = isMac && macIndex !== -1 ? macIndex : 0;
  return (
    <section className="relative px-[22px] pb-6 pt-[34px] text-center md:px-14 md:pb-10 md:pt-[70px]">
      <h1 className="mx-auto mb-4 max-w-[800px] font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--text)] md:mb-5 md:text-[56px] md:leading-[1.02]">
        {heading}{" "}
        {heading_accent && (
          <span className="text-brand-deep dark:text-brand">
            {heading_accent}
          </span>
        )}
      </h1>
      <p className="mx-auto mb-8 max-w-[600px] text-[15.5px] leading-[1.6] text-[var(--text-muted)] md:mb-12 md:text-[17.5px]">
        {intro}
      </p>

      <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-4 text-left md:grid-cols-2 md:gap-5">
        {platforms.map((platform, i) => (
          <div
            key={platform.name}
            className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-solid)] p-6 [box-shadow:var(--shadow-card)] md:p-7"
          >
            <h2 className="mb-4 text-center font-heading text-[19px] font-semibold text-[var(--text)] dark:text-white md:mb-5 md:text-[20px]">
              {platform.name}
            </h2>
            <div className="flex justify-center">
              <AppStoreButton
                href={platform.link}
                rel={platform.rel}
                store={platform.store}
                mobileLabel={platform.store}
                variant={i === primaryIndex ? "primary" : "ghost"}
              />
            </div>
            <span className="mt-5 block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-faint)] md:mt-6">
              Requirements
            </span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {platform.requirements.map((req) => (
                <li
                  key={req}
                  className="flex items-baseline gap-2.5 text-[13.5px] leading-[1.5] text-[var(--text-muted)]"
                >
                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-brand/60" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <IPadFrame />
    </section>
  );
};

export default AuroraDownload;
