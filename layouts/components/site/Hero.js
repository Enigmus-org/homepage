import useOs from "@hooks/useOs";
import AppStoreButton from "./AppStoreButton";
import AppWindow from "./AppWindow";

// Homepage hero on the same flat brand wash as the nav: copy and store links
// beside the drawn app window, stacked below lg. Store links come from the
// content/_index.md banner frontmatter; on macOS the Mac App Store button
// takes the primary style.
const Hero = ({ banner }) => {
  const isMac = useOs();
  return (
    <section className="border-b border-[var(--brand-line)] bg-[var(--brand-wash)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[420px_1fr] lg:gap-14 lg:py-[72px]">
        <div>
          <p className="mb-4 flex items-center gap-2 text-[13px] text-[var(--text-faint)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            Runs on Apple MLX, fully on-device
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.01em] md:text-[48px]">
            Private AI, locally.
          </h1>
          <p className="mb-7 mt-[18px] text-balance text-[16px] leading-[1.65] text-[var(--text-muted)]">
            Private AI for Mac, iPhone, and iPad - powered by Apple&apos;s MLX
            framework. All data stays private and secure through local
            processing on-device. Free and built for privacy.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <AppStoreButton
              href={banner.button.link}
              rel={banner.button.rel}
              label="App Store"
              primary={!isMac}
            />
            {banner.button_mac && (
              <AppStoreButton
                href={banner.button_mac.link}
                rel={banner.button_mac.rel}
                label="Mac App Store"
                primary={isMac}
              />
            )}
          </div>
          <p className="mt-6 text-[12.5px] text-[var(--text-faint)]">
            Free. No account. iOS 18+, macOS 14+.
          </p>
        </div>
        <AppWindow />
      </div>
    </section>
  );
};

export default Hero;
