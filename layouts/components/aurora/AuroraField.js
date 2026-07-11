// Decorative animated aurora glow (design_handoff_aurora_glass AuroraField.tsx).
// Fills its positioned parent: place inside a `relative overflow-hidden`
// container and render the real content as a sibling with `relative z-10`.
// Geometry and blur follow the mock exactly: three blobs on desktop, two on
// mobile; the --aurora-* vars swap alpha per theme.
const AuroraField = () => (
  <div
    className="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden="true"
  >
    {/* top-center blue */}
    <div className="absolute -top-20 left-[20%] h-80 w-80 animate-aurora rounded-full blur-[28px] [background:radial-gradient(circle,var(--aurora-blue),transparent_60%)] md:-top-[120px] md:left-[38%] md:h-[560px] md:w-[560px] md:blur-[30px]" />
    {/* left violet (right side on mobile) */}
    <div className="absolute top-10 right-[-40px] h-[260px] w-[260px] animate-aurora-slow rounded-full blur-[36px] [background:radial-gradient(circle,var(--aurora-violet),transparent_62%)] md:top-[60px] md:left-[8%] md:right-auto md:h-[420px] md:w-[420px] md:blur-[40px]" />
    {/* right teal (desktop only) */}
    <div className="absolute top-[120px] right-[6%] hidden h-[420px] w-[420px] animate-aurora-slower rounded-full blur-[44px] [background:radial-gradient(circle,var(--aurora-teal),transparent_62%)] md:block" />
  </div>
);

export default AuroraField;
