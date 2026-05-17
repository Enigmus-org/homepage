import { useState } from "react";

function RevealEmail({ d, o }) {
  const [email, setEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  const reveal = () => {
    const shift = parseInt(o, 10);
    const codes = d.split(",").map((n) => parseInt(n, 10) - shift);
    setEmail(String.fromCharCode(...codes));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  if (!email) {
    return (
      <button
        type="button"
        onClick={reveal}
        aria-label="reveal contact email"
        className="inline-flex items-center gap-1 rounded border border-current bg-transparent px-2 py-0.5 text-sm font-medium hover:opacity-80"
      >
        show contact email
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <code className="font-mono font-bold">{email}</code>
      <button
        type="button"
        onClick={copy}
        aria-label="copy email to clipboard"
        className="rounded border border-current bg-transparent px-2 py-0.5 text-xs hover:opacity-80"
      >
        {copied ? "copied" : "copy"}
      </button>
    </span>
  );
}

export default RevealEmail;
