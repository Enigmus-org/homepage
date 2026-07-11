// Pill row under the hero chat card (design_handoff_aurora_glass
// FeatureChips.tsx) with the mock's shorter mobile labels.
const CHIPS = [
  { long: "On-device processing", short: "On-device" },
  { long: "No cloud, no data sharing", short: "No cloud" },
  { long: "Apple silicon optimized", short: "Apple silicon" },
];

const chipBase =
  "rounded-chip border px-[13px] py-2 text-[12px] md:px-[17px] md:py-[9px] md:text-[13.5px]";

const FeatureChips = () => (
  <div className="mt-[26px] flex flex-wrap justify-center gap-2 md:mt-10 md:gap-3">
    {CHIPS.map((chip) => (
      <span
        key={chip.short}
        className={`${chipBase} border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] dark:text-[#C6CDDA]`}
      >
        <span className="hidden md:inline">{chip.long}</span>
        <span className="md:hidden">{chip.short}</span>
      </span>
    ))}
    <span
      className={`${chipBase} border-brand/30 bg-brand/[0.14] text-[var(--accent-on-bg)]`}
    >
      Free
    </span>
  </div>
);

export default FeatureChips;
