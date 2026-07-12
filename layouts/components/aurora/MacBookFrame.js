// MacBook Pro showcase under the hero feature chips: a real app screenshot
// inside a code-drawn chassis (bezel, notch, aluminum base) so the frame
// stays crisp at any resolution and follows the light/dark theme. Only the
// screenshot itself is shipped as an image (webp, 1x/2x srcset).
const MacBookFrame = ({ className = "mt-9 md:mt-14" }) => (
  <figure className={`mx-auto max-w-[760px] ${className}`}>
    {/* lid / display */}
    <div className="relative mx-[2.5%] rounded-t-[14px] rounded-b-[3px] border border-black/40 bg-[#0b0e14] p-[9px] shadow-[0_30px_60px_-18px_rgba(7,10,18,0.45)] dark:border-white/10 dark:shadow-[0_30px_70px_-18px_rgba(0,0,0,0.75)] md:rounded-t-[22px] md:p-[15px]">
      {/* notch */}
      <div
        className="absolute left-1/2 top-0 z-10 h-[13px] w-[72px] -translate-x-1/2 rounded-b-[5px] bg-[#0b0e14] md:h-[22px] md:w-[116px] md:rounded-b-[8px]"
        aria-hidden="true"
      />
      <img
        src="/images/home-macbook-1840.webp"
        srcSet="/images/home-macbook-920.webp 920w, /images/home-macbook-1840.webp 1840w"
        sizes="(min-width: 768px) 692px, 90vw"
        width={1840}
        height={1141}
        alt="Enigmus for Mac — a chat about Jungian archetypes, processed fully on-device"
        loading="lazy"
        decoding="async"
        className="!my-0 w-full !rounded-[5px] dark:hidden md:!rounded-[9px]"
      />
      <img
        src="/images/home-macbook-dark-1840.webp"
        srcSet="/images/home-macbook-dark-920.webp 920w, /images/home-macbook-dark-1840.webp 1840w"
        sizes="(min-width: 768px) 692px, 90vw"
        width={1840}
        height={1141}
        alt="Enigmus for Mac — a chat about Jungian archetypes, processed fully on-device"
        loading="lazy"
        decoding="async"
        className="!my-0 hidden w-full !rounded-[5px] dark:block md:!rounded-[9px]"
      />
    </div>
    {/* aluminum base */}
    <div className="relative h-[11px] rounded-t-[2px] rounded-b-[7px] bg-gradient-to-b from-[#e6e8ec] to-[#aeb4bf] shadow-[0_14px_28px_-10px_rgba(7,10,18,0.4)] dark:from-[#3d424d] dark:to-[#1e222b] dark:shadow-[0_16px_34px_-10px_rgba(0,0,0,0.7)] md:h-4 md:rounded-b-[10px]">
      {/* thumb scoop */}
      <div
        className="absolute left-1/2 top-0 h-1/2 w-[11%] -translate-x-1/2 rounded-b-full bg-gradient-to-b from-[#9aa0ab] to-[#ced2d9] dark:from-[#14171d] dark:to-[#2c313b]"
        aria-hidden="true"
      />
    </div>
  </figure>
);

export default MacBookFrame;
