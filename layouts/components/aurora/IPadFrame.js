// iPad showcase under the iPhone frame: same technique as MacBookFrame and
// IPhoneFrame — a code-drawn chassis around a real app screenshot, with
// light/dark variants swapped via the theme class. The screenshots include
// transparent rounded display corners, completed by the black bezel behind
// them. Portrait orientation: power button on top, volume on the right edge.
const shot = (variant) => ({
  src: `/images/home-ipad${variant}-900.webp`,
  srcSet: `/images/home-ipad${variant}-450.webp 450w, /images/home-ipad${variant}-900.webp 900w`,
});

const IPadFrame = () => (
  <figure className="relative mx-auto mt-10 w-[300px] md:mt-16 md:w-[420px]">
    {/* power button (top edge) */}
    <div
      className="absolute -top-[3px] right-[26px] h-[3px] w-9 rounded-t-[2px] bg-[#1c212b] md:right-[36px] md:w-11"
      aria-hidden="true"
    />
    {/* volume buttons (right edge) */}
    <div
      className="absolute -right-[3px] top-[52px] h-6 w-[3px] rounded-r-[2px] bg-[#1c212b] md:top-[72px] md:h-7"
      aria-hidden="true"
    />
    <div
      className="absolute -right-[3px] top-[84px] h-6 w-[3px] rounded-r-[2px] bg-[#1c212b] md:top-[108px] md:h-7"
      aria-hidden="true"
    />
    {/* chassis */}
    <div className="relative rounded-[19px] border border-black/40 bg-[#0b0e14] p-[9px] shadow-[0_24px_48px_-16px_rgba(7,10,18,0.45)] dark:border-white/10 dark:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.75)] md:rounded-[23px] md:p-[11px]">
      <img
        {...shot("")}
        sizes="(min-width: 768px) 398px, 282px"
        width={900}
        height={1200}
        alt="Enigmus for iPad — the welcome screen: private, local-only, open model weights"
        loading="lazy"
        decoding="async"
        className="!my-0 w-full !rounded-none dark:hidden"
      />
      <img
        {...shot("-dark")}
        sizes="(min-width: 768px) 398px, 282px"
        width={900}
        height={1200}
        alt="Enigmus for iPad — the welcome screen: private, local-only, open model weights"
        loading="lazy"
        decoding="async"
        className="!my-0 hidden w-full !rounded-none dark:block"
      />
    </div>
  </figure>
);

export default IPadFrame;
