// Fenced code blocks (```bash) render as a terminal window: a title bar with
// traffic lights and the language label, then the highlighted body on a dark
// canvas in both themes (`.terminal-block` in styles/aurora.scss). Registered
// as the `pre` element override in shortcodes/all.js, so every fenced block on
// the site gets the chrome. Highlighting happens at build time
// (lib/utils/mdxParser.js) — nothing is shipped to the browser for it.

// Shell dialects all read as "bash"; other languages show as written.
const LABELS = { sh: "bash", shell: "bash", console: "bash" };

const CodeBlock = ({ children, ...rest }) => {
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
      </div>
      <pre {...rest}>{children}</pre>
    </div>
  );
};

export default CodeBlock;
