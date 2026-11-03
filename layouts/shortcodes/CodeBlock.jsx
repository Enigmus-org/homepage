// Fenced code blocks (```bash) render as a terminal window: a title bar with
// traffic lights and the language label, then the highlighted body on a dark
// canvas in both themes (`.terminal-block` in styles/design.scss). Registered
// as the `pre` element override in shortcodes/all.js, so every fenced block on
// the site gets the chrome. Highlighting happens at build time
// (lib/utils/mdxParser.js) — nothing is shipped to the browser for it.
//
// `copy` adds a copy button to the bar that copies the block's text as shown.
// MDX never passes it, so it is opt-in for components (the homepage curl);
// the code stays selectable when clipboard access is denied.

import { useRef, useState } from "react";
import { IoCheckmark, IoCopyOutline } from "react-icons/io5";

// Shell dialects all read as "bash"; other languages show as written.
const LABELS = { sh: "bash", shell: "bash", console: "bash" };

// `alone`: no label before it, so the button takes the push to the right.
const CopyButton = ({ source, alone }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source.current?.textContent ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Denied clipboard: the code is still visible and selectable.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy code"
      className={`${alone ? "ml-auto" : "ml-3"} inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6e7681] transition hover:text-[#e6edf3]`}
    >
      {copied ? (
        <>
          <IoCheckmark aria-hidden="true" className="text-[#7ee787]" />
          Copied
        </>
      ) : (
        <>
          <IoCopyOutline aria-hidden="true" />
          Copy
        </>
      )}
    </button>
  );
};

const CodeBlock = ({ children, copy = false, ...rest }) => {
  const pre = useRef(null);
  const language = /language-([\w-]+)/.exec(children?.props?.className ?? "")?.[1];
  const label = language ? LABELS[language] ?? language : null;

  return (
    <div className="terminal-block">
      <div className="terminal-block__bar">
        <span className="terminal-block__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {label && <span className="terminal-block__label">{label}</span>}
        {copy && <CopyButton source={pre} alone={!label} />}
      </div>
      <pre ref={pre} {...rest}>
        {children}
      </pre>
    </div>
  );
};

export default CodeBlock;
