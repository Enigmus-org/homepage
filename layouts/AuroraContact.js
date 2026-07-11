import RevealEmail from "@shortcodes/RevealEmail";

// Aurora contact page: heading + intro from frontmatter and a glass card
// with the obfuscated reveal-email control. Rendered inside AuroraBase by
// pages/[regular].js.
const AuroraContact = ({ data }) => {
  const { heading, heading_accent, intro, email_d, email_o } =
    data.frontmatter;
  return (
    <section className="relative px-[22px] pb-16 pt-[34px] text-center md:px-14 md:pb-24 md:pt-[70px]">
      <h1 className="mx-auto mb-4 max-w-[800px] font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--text)] md:mb-5 md:text-[56px] md:leading-[1.02]">
        {heading}{" "}
        {heading_accent && (
          <span className="text-brand-deep dark:text-brand">
            {heading_accent}
          </span>
        )}
      </h1>
      {intro && (
        <p className="mx-auto max-w-[600px] text-[15.5px] leading-[1.6] text-[var(--text-muted)] md:text-[17.5px]">
          {intro}
        </p>
      )}
      {email_d && email_o && (
        <div className="mx-auto mt-10 max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--surface-solid)] p-8 text-[var(--text)] [box-shadow:var(--shadow-card)] md:mt-12">
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-faint)]">
            Email
          </p>
          <RevealEmail d={email_d} o={email_o} />
        </div>
      )}
    </section>
  );
};

export default AuroraContact;
