import AppStoreButton from "./AppStoreButton";
import ChatCard from "./ChatCard";
import DeviceShowcase from "./DeviceShowcase";
import FeatureChips from "./FeatureChips";

// Centered hero over the aurora field (design_handoff_aurora_glass Hero.tsx).
// Copy follows the approved mock (which mirrors the live site's message);
// store links come from content/_index.md banner frontmatter.
const Hero = ({ banner }) => (
  <section className="relative px-[22px] pb-[30px] pt-[34px] text-center md:px-14 md:pb-10 md:pt-[78px]">
    {/* status pill */}
    <div className="mb-[22px] inline-flex items-center gap-2 rounded-chip border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--accent-on-bg)] md:mb-7 md:gap-[9px] md:px-[15px] md:py-[7px] md:text-[13px] md:tracking-[0.04em]">
      <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_#1FA3FB] md:h-[7px] md:w-[7px]" />
      <span className="hidden md:inline">
        Powered by Apple MLX · 100% on-device
      </span>
      <span className="md:hidden">Apple MLX · on-device</span>
    </div>

    {/* headline */}
    <h1 className="mx-auto mb-4 max-w-[900px] font-display text-[44px] font-extrabold leading-none tracking-[-0.03em] text-[var(--text)] md:mb-[22px] md:text-[82px] md:leading-[0.98] md:tracking-[-0.04em]">
      Private AI,
      <br />
      <span className="bg-brand-text-light bg-clip-text text-transparent dark:bg-brand-text">
        locally.
      </span>
    </h1>

    <p className="mx-auto mb-[26px] max-w-[600px] text-[15.5px] leading-[1.55] text-[var(--text-muted)] md:mb-[34px] md:text-[18.5px] md:leading-[1.6]">
      Private AI for Mac, iPhone, and iPad — powered by Apple&rsquo;s MLX
      framework.{" "}
      <span className="hidden md:inline">
        All data stays private and secure through local processing on-device.
      </span>
      <span className="md:hidden">All processing runs on-device.</span>{" "}
      <span className="font-semibold text-[var(--text)]">
        Free and built for privacy.
      </span>
    </p>

    {/* download buttons */}
    <div className="mb-[30px] flex flex-col gap-[11px] md:mb-3.5 md:flex-row md:justify-center md:gap-3.5">
      <AppStoreButton
        href={banner.button.link}
        rel={banner.button.rel}
        store="App Store"
        mobileLabel="Download — App Store"
        variant="primary"
      />
      {banner.button_mac && (
        <AppStoreButton
          href={banner.button_mac.link}
          rel={banner.button_mac.rel}
          store="Mac App Store"
          mobileLabel="Mac App Store"
          variant="ghost"
        />
      )}
    </div>

    {/* chat card */}
    <div className="mx-auto max-w-[760px] md:mt-[52px]">
      <ChatCard />
    </div>

    <FeatureChips />

    <DeviceShowcase />
  </section>
);

export default Hero;
