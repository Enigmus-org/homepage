import config from "@config/config.json";
import { useState } from "react";
import Icon from "./Icon";

const SITE = config.site.base_url.replace(/\/$/, "");
const RSS_URL = `${SITE}/feed.xml`;

const RSS = "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2z";
const COPY =
  "M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2";
const CHECK = "M20 6 9 17l-5-5";

// Subscribe panel for the blog index and the homepage. Feed readers want the
// address rather than a click-through, so it is printed as selectable text:
// the copy button is a shortcut, not the only way to get it (clipboard access
// can be denied, and the panel has to stay useful when it is).
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
      className={`mx-auto w-full max-w-[760px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)] ${className}`}
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
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-brand/[0.14] px-3.5 py-2 text-[13px] font-medium text-[var(--accent-on-bg)] transition-colors hover:border-[var(--text-faint)]"
          >
            <Icon d={RSS} className="h-3 w-3" />
            RSS
          </a>
          <a
            href="/feed.json"
            className="inline-flex items-center rounded-[10px] border border-[var(--border)] px-3.5 py-2 font-mono text-[12px] text-[var(--text-muted)] transition-colors hover:border-[var(--text-faint)] hover:text-[var(--text)]"
          >
            JSON
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-2.5 md:px-6">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-[12px] text-[var(--text-dim)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:text-[12.5px]">
          {RSS_URL}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy feed address ${RSS_URL}`}
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
        >
          {copied ? (
            <>
              <Icon d={CHECK} className="h-3 w-3 text-[var(--accent-on-bg)]" />
              Copied
            </>
          ) : (
            <>
              <Icon d={COPY} className="h-3 w-3" />
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
