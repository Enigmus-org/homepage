import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// The hero's drawn app window: a mock of the Enigmus chat UI (conversation
// list, model picker, thread, composer), styled like the WebUI. The four
// conversations in the sidebar are buttons that swap the thread, model and
// context counter; the sidebar is hidden on phones, which keep the first.
// Like the app, the thread opens scrolled to its latest message when it is
// taller than the window (narrow widths only). Set in Instrument Sans
// (font-chat), preloaded here as the window sits above the fold; the context
// counter stays in mono.
const CHAT_FONT = "/fonts/instrument-sans-latin-wght-normal.woff2";
const THINKING = "M13 2 3 14h9l-1 8 10-12h-9l1-8z"; // lightning
const COPY = "M9 9h11v11H9zM5 15H4V4h11v1"; // two stacked sheets

// Each message is [from, text]; a reply may carry a thinking time in seconds.
// A reply's text can also be a list of paragraphs and { lang, code } blocks.
const CHATS = [
  {
    title: "NDA clause summary",
    when: "just now",
    model: "Gemma 4 31B",
    ctx: "412/8.2k",
    messages: [
      ["user", "Summarize this NDA clause."],
      [
        "model",
        "In short: both parties agree to keep shared information confidential for 3 years, with standard carve-outs for anything already public.",
      ],
    ],
  },
  {
    title: "Trip packing list",
    when: "yesterday",
    model: "Gemma 4 12B",
    ctx: "236/8.2k",
    messages: [
      ["user", "Packing list: 4 days in Lisbon, October."],
      [
        "model",
        "Light layers, a rain jacket, grippy shoes for the cobbled hills, an EU plug adapter.",
      ],
      ["user", "Carry-on only?"],
      ["model", "Yes, with the jacket and shoes worn on the flight."],
    ],
  },
  {
    title: "Explain MLX quantization",
    when: "2 days ago",
    model: "Qwen 3.6 27B",
    ctx: "587/8.2k",
    thinking: true,
    messages: [
      ["user", "Explain MLX quantization."],
      [
        "model",
        "Weights are stored as 4-bit integers in groups of 64, each group with a scale and bias - about 4.5 bits per weight.",
        6,
      ],
    ],
  },
  {
    title: "Fibonacci in Python",
    when: "last week",
    model: "Gemma 4 26B",
    ctx: "318/8.2k",
    messages: [
      ["user", "Write the first 5 elements of the Fibonacci series in Python."],
      [
        "model",
        [
          "Each number is the sum of the two before it:",
          {
            lang: "python",
            code: "a, b = 0, 1\nfor _ in range(5):\n    print(a)\n    a, b = b, a + b",
          },
        ],
      ],
    ],
  },
];

const Dot = ({ className }) => (
  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`} />
);

// Just enough Python highlighting for the mock, with highlight.js class names
// so the terminal block's GitHub Dark colors apply (posts are highlighted at
// build time instead).
const TOKEN =
  /\b(for|in|def|return|if|else|while)\b|\b(print|range|len)\b|\b(\d+)\b/g;
const TOKEN_CLASS = ["hljs-keyword", "hljs-built_in", "hljs-number"];

const highlight = (code) => {
  const out = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    out.push(code.slice(last, m.index));
    out.push(
      <span
        key={m.index}
        className={TOKEN_CLASS[m.slice(1).findIndex(Boolean)]}
      >
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return out;
};

// Code in a reply: the site's terminal block in its compact form - language
// and copy icon in the bar, no traffic lights.
const Code = ({ lang, code }) => (
  <div className="terminal-block terminal-block--compact">
    <div className="terminal-block__bar">
      <span className="font-mono text-[10.5px] tracking-[0.08em] text-[#6e7681]">
        {lang}
      </span>
      <Icon d={COPY} className="ml-auto h-3 w-3 text-[#6e7681]" />
    </div>
    <pre>
      <code>{highlight(code)}</code>
    </pre>
  </div>
);

const AppWindow = () => {
  const [active, setActive] = useState(0);
  const chat = CHATS[active];
  const thread = useRef(null);

  useEffect(() => {
    thread.current.scrollTop = thread.current.scrollHeight;
  }, [active]);

  return (
    <>
      <Head>
        <link
          key="font-chat"
          rel="preload"
          href={CHAT_FONT}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <div
        role="figure"
        aria-label="The Enigmus chat window, offline, with three example conversations"
        className="grid h-[380px] overflow-hidden rounded-[14px] border border-[var(--brand-line)] bg-[var(--bg)] text-left font-chat shadow-[0_24px_48px_-28px_rgba(13,111,209,0.35)] dark:shadow-none sm:grid-cols-[180px_1fr] md:h-[440px]"
      >
        <aside className="hidden flex-col gap-1.5 border-r border-[var(--border)] bg-[var(--brand-wash)] p-2.5 text-[11.5px] sm:flex">
          <span
            aria-hidden="true"
            className="mb-1 flex items-center justify-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] py-2 text-[var(--text-dim)]"
          >
            <Icon d="M12 5v14M5 12h14" className="h-3 w-3" />
            New Chat
          </span>
          {CHATS.map(({ title, when }, i) => (
            <button
              key={title}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`rounded-[10px] border px-2.5 py-2 text-left transition-colors ${
                i === active
                  ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                  : "border-transparent text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {title}
              <span className="mt-0.5 block text-[10px] text-[var(--text-faint)]">
                {when}
              </span>
            </button>
          ))}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
            <span className="inline-flex items-center gap-2 rounded-[9px] border border-[var(--border)] px-2.5 py-1.5 text-[12.5px]">
              <Dot className="bg-brand" />
              {chat.model}
              <Icon
                d="M6 9l6 6 6-6"
                className="h-3 w-3 text-[var(--text-faint)]"
              />
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-faint)]">
              <Dot className="bg-[#10b981]" />
              Offline
            </span>
          </div>

          <div
            ref={thread}
            aria-live="polite"
            tabIndex={0}
            className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-5 text-[13.5px] leading-[1.6] [scrollbar-width:none]"
          >
            {chat.messages.map(([from, text, thought], i) =>
              from === "user" ? (
                <span
                  key={i}
                  className="self-end rounded-[14px] border border-brand/25 bg-brand/10 px-3.5 py-2 text-[#0b5fb3] dark:text-[#d6efff]"
                >
                  {text}
                </span>
              ) : (
                <div key={i} className="max-w-[90%] text-[var(--text-muted)]">
                  {thought && (
                    <span className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--text-faint)]">
                      <Icon d={THINKING} className="h-3 w-3" />
                      Thought for {thought}s
                    </span>
                  )}
                  {[]
                    .concat(text)
                    .map((part, j) =>
                      typeof part === "string" ? (
                        <p key={j}>{part}</p>
                      ) : (
                        <Code key={j} {...part} />
                      )
                    )}
                </div>
              )
            )}
          </div>

          <div
            aria-hidden="true"
            className="mx-4 mb-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 pb-2 pt-2.5"
          >
            <span className="text-[13px] text-[var(--text-faint)]">
              Type a message...
            </span>
            <div className="mt-2.5 flex items-center gap-3 text-[var(--text-faint)]">
              <Icon
                d={THINKING}
                className={`h-3.5 w-3.5 ${chat.thinking ? "text-brand" : ""}`}
              />
              <span className="ml-auto font-mono text-[11px]">
                ctx {chat.ctx}
              </span>
              <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-brand text-white">
                <Icon
                  d="M12 19V5M5 12l7-7 7 7"
                  className="h-3 w-3"
                  strokeWidth={2.4}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppWindow;
