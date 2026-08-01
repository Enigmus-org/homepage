// Extra token pass for shell code blocks, run after rehype-highlight.
//
// highlight.js's bash grammar only marks comments, strings, and shell built-ins,
// so a block of CLI invocations comes out almost monochrome — the two things
// that carry the meaning in a terminal, the command being run and its flags, are
// left as plain text. This wraps those in `sh-cmd` / `sh-flag` spans (colored in
// styles/aurora.scss), inside shell blocks only. Whatever highlight.js already
// tokenized is left alone: only the code element's own text children are read.

const SHELL = new Set(
  ["bash", "sh", "shell", "zsh", "console"].map((l) => `language-${l}`)
);
const FLAG = /^--?[A-Za-z][\w-]*$/;
const COMMAND = /^[A-Za-z_][\w./-]*$/;

const span = (className, value) => ({
  type: "element",
  tagName: "span",
  properties: { className: [className] },
  children: [{ type: "text", value }],
});

// Splits one text fragment into plain text and token spans. A word is a command
// rather than an argument when it opens a line, so only the fragment starting
// the block — and anything after a newline — can begin one.
const tokenize = (value, startsLine) => {
  const nodes = [];
  let plain = "";
  let atCommand = startsLine;
  const flush = () => {
    if (plain) nodes.push({ type: "text", value: plain });
    plain = "";
  };

  // Split on whitespace, keeping the separators so spacing survives.
  for (const part of value.split(/(\n|[ \t]+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      plain += part;
      if (part === "\n") atCommand = true;
      continue;
    }
    if (FLAG.test(part)) {
      flush();
      nodes.push(span("sh-flag", part));
    } else if (atCommand && COMMAND.test(part)) {
      flush();
      nodes.push(span("sh-cmd", part));
    } else {
      plain += part;
    }
    atCommand = false;
  }

  flush();
  return nodes;
};

const isShellCode = (node) => {
  const classes = node.properties?.className;
  return (
    node.tagName === "code" &&
    Array.isArray(classes) &&
    classes.some((c) => SHELL.has(c))
  );
};

const rehypeShellTokens = () => (tree) => {
  const walk = (node) => {
    if (isShellCode(node)) {
      node.children = node.children.flatMap((child, i) =>
        child.type === "text" ? tokenize(child.value, i === 0) : child
      );
      return;
    }
    node.children?.forEach(walk);
  };

  walk(tree);
};

export default rehypeShellTokens;
