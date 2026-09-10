// iPad showcase under the iPhone frame: same technique as MacBookFrame and
// IPhoneFrame - a code-drawn chassis around a real app screenshot, with
// light/dark variants swapped via the theme class. The screenshots include
// transparent rounded display corners, completed by the black bezel behind
// them. Portrait orientation: power button on top, volume on the right edge.
//
// `src` is an asset base path: the component loads `<src>-900.webp` with a
// `<src>-450.webp` alternative, and, when `dark` is set, swaps in the
// `-dark-*` pair via the theme class. Chassis metrics are the fixed pixel
// values the bezel was drawn for at the two default widths, so a caller that
// overrides `className` should stay on 300px / 420px to keep the proportions.
const shot = (src, variant) => ({
  src: `${src}${variant}-900.webp`,
  srcSet: `${src}${variant}-450.webp 450w, ${src}${variant}-900.webp 900w`,
});

const IPadFrame = ({
  className = "relative mx-auto mt-10 w-[300px] md:mt-16 md:w-[420px]",
  src = "/images/home-ipad",
  alt = "Enigmus for iPad - the welcome screen: private, local-only, open model weights",
  height = 1200,
  sizes = "(min-width: 768px) 398px, 282px",
  dark = true,
}) => {
  // `alt` is passed on each element rather than spread with the rest:
  // jsx-a11y/alt-text cannot see attributes arriving through a spread and
  // reports them as missing.
  const img = {
    sizes,
    width: 900,
    height,
    loading: "lazy",
    decoding: "async",
  };
  return (
    <figure className={className}>
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
          {...shot(src, "")}
          {...img}
          alt={alt}
          className={`!my-0 w-full !rounded-none ${dark ? "dark:hidden" : ""}`}
        />
        {dark && (
          <img
            {...shot(src, "-dark")}
            {...img}
            alt={alt}
            className="!my-0 hidden w-full !rounded-none dark:block"
          />
        )}
      </div>
    </figure>
  );
};

export default IPadFrame;
