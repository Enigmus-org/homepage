// Minimal device frames around real app screenshots: a flat dark bezel with
// a hairline edge, no buttons, notch or shading. Metrics are in cqw (percent
// of the frame's own width), so every frame keeps its proportions at any
// size; callers set width and spacing through `className`.
//
// `src` is an asset base path: the frame loads `<src>-<w>.webp` at the two
// widths it lists and, when `dark` is set, swaps in the `-dark-*` pair via
// the theme class. iPhone and iPad screenshots carry their own transparent
// rounded display corners; the bezel behind them completes the shape.

const BEZEL =
  "bg-[#111214] ring-1 ring-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_24px_48px_-28px_rgba(0,0,0,0.4)] dark:ring-white/15 dark:shadow-none";

const Screen = ({ src, widths: [lo, hi], height, alt, sizes, dark, screen }) => {
  const img = (variant, theme) => (
    <img
      src={`${src}${variant}-${hi}.webp`}
      srcSet={`${src}${variant}-${lo}.webp ${lo}w, ${src}${variant}-${hi}.webp ${hi}w`}
      sizes={sizes}
      width={hi}
      height={height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`!my-0 w-full align-top ${screen} ${theme}`}
    />
  );
  return (
    <>
      {img("", dark ? "dark:hidden" : "")}
      {dark && img("-dark", "hidden dark:block")}
    </>
  );
};

// Builds a frame component from its bezel shape and default props; `base`
// renders under the bezel (the Mac's keyboard deck).
const frame = ({ bezel, screen = "!rounded-none", base = null, ...defaults }) => {
  const Frame = (props) => {
    const { className, ...shot } = { ...defaults, ...props };
    return (
      <figure className={`mx-auto [container-type:inline-size] ${className}`}>
        <div className={`${BEZEL} ${bezel}`}>
          <Screen screen={screen} {...shot} />
        </div>
        {base}
      </figure>
    );
  };
  return Frame;
};

export const IPhoneFrame = frame({
  bezel: "rounded-[14cqw] p-[2.4cqw]",
  widths: [600, 1200],
  src: "/images/home-iphone",
  alt: "Enigmus for iPhone - a chat about Euler's formula, processed on-device",
  height: 2607,
  sizes: "(min-width: 768px) 280px, 240px",
  dark: true,
  className: "mt-10 w-[240px] md:mt-16 md:w-[280px]",
});

export const IPadFrame = frame({
  bezel: "rounded-[6cqw] p-[2.8cqw]",
  widths: [450, 900],
  src: "/images/home-ipad",
  alt: "Enigmus for iPad - the welcome screen: private, local-only, open model weights",
  height: 1200,
  sizes: "(min-width: 768px) 420px, 300px",
  dark: true,
  className: "mt-10 w-[300px] md:mt-16 md:w-[420px]",
});

export const MacBookFrame = frame({
  bezel: "mx-[2.5cqw] rounded-t-[2.6cqw] rounded-b-[0.5cqw] p-[1.6cqw]",
  screen: "!rounded-[0.8cqw]",
  base: (
    <div className="h-[1.6cqw] rounded-b-[1.2cqw] rounded-t-[0.3cqw] bg-[#d4d7dc] dark:bg-[#2a2d32]" />
  ),
  widths: [920, 1840],
  src: "/images/home-macbook",
  alt: "Enigmus for Mac - a chat about Jungian archetypes, processed fully on-device",
  height: 1141,
  sizes: "(min-width: 768px) 700px, 90vw",
  dark: true,
  className: "mt-9 max-w-[760px] md:mt-14",
});
