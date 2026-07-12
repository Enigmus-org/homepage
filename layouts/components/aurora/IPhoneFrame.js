// iPhone frame: a code-drawn chassis (black bezel plus side buttons) around
// a real app screenshot, with light/dark variants swapped via the theme
// class. The screenshots already include the Dynamic Island and transparent
// rounded display corners, so the bezel behind them completes the corners
// without any clipping. Chassis metrics use container-relative units
// (cqw / %), so the frame keeps its proportions at any rendered width;
// callers set width and margins via className (the default suits standalone
// use, e.g. /elements).
const shot = (variant) => ({
  src: `/images/home-iphone${variant}-1200.webp`,
  srcSet: `/images/home-iphone${variant}-600.webp 600w, /images/home-iphone${variant}-1200.webp 1200w`,
});

const IPhoneFrame = ({
  className = "relative mt-10 w-[240px] md:mt-16 md:w-[280px]",
}) => (
  <figure className={`mx-auto [container-type:inline-size] ${className}`}>
    {/* side buttons */}
    <div
      className="absolute -left-[3px] top-[19%] h-[5%] w-[3px] rounded-l-[2px] bg-[#1c212b]"
      aria-hidden="true"
    />
    <div
      className="absolute -left-[3px] top-[26.5%] h-[8%] w-[3px] rounded-l-[2px] bg-[#1c212b]"
      aria-hidden="true"
    />
    <div
      className="absolute -right-[3px] top-[28%] h-[12%] w-[3px] rounded-r-[2px] bg-[#1c212b]"
      aria-hidden="true"
    />
    {/* chassis */}
    <div className="relative rounded-[14.6cqw] border border-black/40 bg-[#0b0e14] p-[2.9cqw] shadow-[0_24px_48px_-16px_rgba(7,10,18,0.45)] dark:border-white/30 dark:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.75)]">
      <img
        {...shot("")}
        sizes="(min-width: 768px) 264px, 226px"
        width={1200}
        height={2607}
        alt="Enigmus for iPhone — a chat about Euler's formula, processed on-device"
        loading="lazy"
        decoding="async"
        className="!my-0 w-full !rounded-none dark:hidden"
      />
      <img
        {...shot("-dark")}
        sizes="(min-width: 768px) 264px, 226px"
        width={1200}
        height={2607}
        alt="Enigmus for iPhone — a chat about Euler's formula, processed on-device"
        loading="lazy"
        decoding="async"
        className="!my-0 hidden w-full !rounded-none dark:block"
      />
    </div>
  </figure>
);

export default IPhoneFrame;
