import { IPhoneFrame } from "./DeviceFrames";
import Icon from "./Icon";

// A Mac serving the web UI to an iPhone over the local network: a line-drawn
// laptop on its LLM Server screen, an arrow carrying the LAN address, and the
// real web UI screenshot in the iPhone frame. Side by side from `md`, stacked
// with the arrow turning down below it. In the feeds only the screenshot
// travels (lib/feedGenerator.js), so `alt` describes the screenshot alone.
//
// Text sits in spans, not `p`, so the prose margins do not reach it. Laptop
// metrics are in cqw, as in DeviceFrames, so it keeps its shape at any width.

// The app's server rack: three bays, a light on the right of each.
const RACK =
  "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM3 9h18M3 15h18M17 6h.01M17 12h.01M17 18h.01";

const LINE = "border-black/25 dark:border-white/25";

const Laptop = () => (
  <div className="w-[280px] [container-type:inline-size] md:w-auto md:min-w-0 md:flex-1">
    <div
      className={`mx-[5cqw] rounded-t-[3cqw] rounded-b-[0.6cqw] border-[1.5px] p-[2.2cqw] ${LINE}`}
    >
      <div className="flex aspect-[16/10] flex-col items-center rounded-[1.2cqw] border border-[var(--border)] bg-[var(--surface)] px-[4cqw] pt-[3cqw]">
        <span className="text-[clamp(10px,3.2cqw,12px)] font-semibold text-[var(--text-muted)]">
          LLM Server
        </span>
        <span className="mt-[7cqw] text-[clamp(11px,4.2cqw,15px)] text-[var(--accent-on-bg)]">
          Active
        </span>
        <Icon
          d={RACK}
          strokeWidth={1.4}
          className="mt-[1.5cqw] h-[15cqw] w-[15cqw] text-[var(--text-faint)]"
        />
        <span className="mt-[1.5cqw] font-mono text-[clamp(9px,2.8cqw,11px)] text-[var(--text-faint)]">
          port 31415
        </span>
      </div>
    </div>
    <div className={`h-[2.4cqw] rounded-b-[2cqw] border-[1.5px] ${LINE}`} />
  </div>
);

const Arrow = ({ address }) => (
  <div className="flex shrink-0 flex-col items-center gap-2 text-[var(--accent-on-bg)]">
    <span className="whitespace-nowrap font-mono text-[11px] text-[var(--text-dim)]">
      {address}
    </span>
    <svg
      viewBox="0 0 12 40"
      className="h-10 w-3 md:hidden"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 1v37M1 33l5 5 5-5" />
    </svg>
    <svg
      viewBox="0 0 168 12"
      className="hidden h-3 w-[168px] md:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 6h165M161 1l5 5-5 5" />
    </svg>
  </div>
);

const WebUISketch = ({ src, alt, address, className = "" }) => (
  <figure
    className={`flex flex-col items-center gap-4 md:flex-row md:gap-4 ${className}`}
  >
    <Laptop />
    <Arrow address={address} />
    <IPhoneFrame
      src={src}
      alt={alt}
      dark={false}
      sizes="(min-width: 768px) 140px, 180px"
      className="w-[180px] shrink-0 md:w-[140px]"
    />
  </figure>
);

export default WebUISketch;
