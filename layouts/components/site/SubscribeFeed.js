import config from "@config/config.json";
import { useState } from "react";
import { IoCheckmark, IoCopyOutline, IoLogoRss } from "react-icons/io5";

const SITE = config.site.base_url.replace(/\/$/, "");
const RSS_URL = `${SITE}/feed.xml`;

// Glass subscribe panel for the blog index. Feed readers want the address
// rather than a click-through, so it is printed as selectable text: the copy
// button is a shortcut, not the only way to get it (clipboard access can be
// denied, and the panel has to stay useful when it is).
// `className` carries the surrounding margin so the blog index and the
// homepage can each space it against their own section rhythm.
const SubscribeFeed = ({ className = "" }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(RSS_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Denied clipboard: the URL above is still visible and selectable.
    }
  };

  return (
    <div
      className={`mx-auto w-full max-w-[760px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl ${className}`}
    >
      <div className="flex flex-col items-center gap-3.5 px-5 py-4 md:flex-row md:justify-between md:gap-6 md:px-6 md:py-[18px]">
        <div className="text-center md:text-left">
          <span className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-faint)]">
            Subscribe
          </span>
          <p className="text-[13.5px] leading-[1.5] text-[var(--text-muted)]">
            New posts arrive in any feed reader. No account, no tracking.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/feed.xml"
            className="inline-flex items-center gap-2 rounded-chip border border-[var(--border)] bg-brand/[0.14] px-3.5 py-2 text-[13px] font-medium text-[var(--accent-on-bg)] transition hover:-translate-y-0.5"
          >
            <IoLogoRss aria-hidden="true" />
            RSS
          </a>
          <a
            href="/feed.json"
            className="inline-flex items-center rounded-chip border border-[var(--border)] px-3.5 py-2 font-mono text-[12px] text-[var(--text-muted)] transition hover:-translate-y-0.5 hover:text-[var(--text)]"
          >
            JSON
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-2.5 md:px-6">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-[12px] text-[var(--text-dim)] scrollbar-none md:text-[12.5px]">
          {RSS_URL}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy feed address ${RSS_URL}`}
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-[var(--text-faint)] transition hover:text-[var(--text)]"
        >
          {copied ? (
            <>
              <IoCheckmark aria-hidden="true" className="text-[var(--accent-on-bg)]" />
              Copied
            </>
          ) : (
            <>
              <IoCopyOutline aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscribeFeed;
export { RSS_URL };
