import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// The hero's drawn app window: the Enigmus Mac app at its own sizes - chat
// list on the brand wash (hairline-separated rows, the active one raised),
// toolbar, thread and composer. The five chats are buttons that swap the
// thread, thinking chip and context count, each short enough to fit without
// scrolling. The composer's two chips open menus: Fast or Think for the
// chat, and the model, which is app-wide. The list is hidden on phones,
// which keep the first.
const P = {
  plus: "M12 5v14M5 12h14",
  sidebar: "M3 5h18v14H3zM9 5v14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  right: "M9 6l6 6-6 6",
  up: "M6 15l6-6 6 6",
  down: "M6 9l6 6 6-6",
  rack: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1", // two stacked sheets
  bolt: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  brain: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18zM12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18zM15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4M12 5v13",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  send: "M12 19V5M5 12l7-7 7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
};

const MODELS = ["Gemma 4 31B-it-OptiQ-4bit", "Qwen 3.6 35B-A3B-4bit"];

// Each message is [from, text, meta]; a reply's meta holds its decode speed
// and, after reasoning, the thinking time in seconds. A reply's text can be
// a list of paragraphs (**bold** marked) and { lang, code } blocks. A chat's
// title is its first message, as in the app.
const CHATS = [
  {
    when: "11/15/2026, 2:14 PM",
    ctx: "1,124",
    messages: [
      ["user", "Summarize this NDA clause and flag anything unusual."],
      [
        "model",
        [
          "Both parties keep shared information confidential for **3 years**.",
          "One flag: the term runs from the **last disclosure**, not the signing date, so it can run much longer.",
        ],
        { tps: 18 },
      ],
    ],
  },
  {
    when: "11/14/2026, 9:41 PM",
    ctx: "731",
    thinking: true,
    messages: [
      [
        "user",
        "I panic when my partner doesn't text back. Is that anxious attachment?",
      ],
      [
        "model",
        "Possibly: **anxious attachment** is a tendency to read silence as rejection, and about **19%** of adults described themselves this way (Hazan & Shaver, 1987).",
        { tps: 21, thought: 8 },
      ],
    ],
  },
  {
    when: "11/12/2026, 10:03 AM",
    ctx: "486",
    messages: [
      ["user", "Find the 5 most common words in notes.txt with Python."],
      [
        "model",
        {
          lang: "python",
          code: 'from collections import Counter\nwords = open("notes.txt").read().split()\nprint(Counter(words).most_common(5))',
        },
        { tps: 52 },
      ],
    ],
  },
  {
    when: "11/8/2026, 7:26 PM",
    ctx: "388",
    messages: [
      ["user", "Why is the sky blue but sunsets red?"],
      [
        "model",
        [
          "Air scatters short wavelengths far more than long ones (**Rayleigh scattering**), so blue arrives from all over the sky.",
          "At sunset the light crosses far more air and the blue scatters away first, leaving the reds.",
        ],
        { tps: 41 },
      ],
    ],
  },
  {
    when: "11/3/2026, 11:47 PM",
    ctx: "402",
    messages: [
      ["user", "Can an AI tell my personality from what I type?"],
      [
        "model",
        "Yes. From **300 Facebook likes**, a model judged personality better than a person's spouse did (Youyou et al., 2015), and word choice alone predicts traits like extraversion.",
        { tps: 38 },
      ],
    ],
  },
];

const Dot = ({ className }) => (
  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`} />
);

const Lights = ({ className = "" }) => (
  <span className={`flex gap-2 ${className}`}>
    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
  </span>
);

// Copy and play under every message, plus a reply's decode speed.
const Actions = ({ tps }) => (
  <span
    aria-hidden="true"
    className="flex items-center gap-2.5 text-[var(--text-dim)]"
  >
    <Icon d={P.copy} className="h-3 w-3" />
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
      <path d="M7 4.5v15l12.5-7.5z" />
    </svg>
    {tps && <span className="text-[11px] tabular-nums">{tps} tok/s</span>}
  </span>
);

const bold = (text) =>
  text.split(/\*\*(.+?)\*\*/).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-[var(--text)]">
        {part}
      </strong>
    ) : (
      part
    )
  );

// Just enough Python highlighting for the mock, with highlight.js class names
// so the terminal block's colors apply (posts are highlighted at build time
// instead).
const TOKEN =
  /\b(for|in|if|else|def|return|while|import|from)\b|\b(print|range|len|open)\b|\b(\d+)\b|("[^"]*")/g;
const TOKEN_CLASS = ["hljs-keyword", "hljs-built_in", "hljs-number", "hljs-string"];

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
      <Icon d={P.copy} className="ml-auto h-3 w-3 text-[#6e7681]" />
    </div>
    <pre>
      <code>{highlight(code)}</code>
    </pre>
  </div>
);

const Part = ({ part }) =>
  typeof part === "string" ? <p>{bold(part)}</p> : <Code {...part} />;

// A composer chip whose menu opens over the thread, as the app's pickers do.
// Each option is { name, icon }; the chosen one carries a brand check.
const Picker = ({
  options,
  value,
  onChange,
  className = "",
  chip,
  label,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.key === "Escape" || !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative flex ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
        className={`items-center transition-colors duration-150 ${chip}`}
      >
        {children}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-10 mb-2 flex w-max flex-col rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[12px] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.3)]"
        >
          {options.map(({ name, icon }, i) => (
            <button
              key={name}
              type="button"
              role="menuitemradio"
              aria-checked={i === value}
              onClick={() => {
                onChange(i);
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-left hover:bg-[var(--bg)]"
            >
              {icon}
              {name}
              <Icon
                d={P.check}
                className={`ml-4 h-3 w-3 text-brand ${
                  i === value ? "" : "invisible"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MODEL_OPTIONS = MODELS.map((name) => ({
  name,
  icon: <Dot className="bg-brand" />,
}));

const MODES = [
  {
    name: "Fast",
    icon: <Icon d={P.bolt} className="h-3 w-3 text-[#edb82e]" />,
  },
  {
    name: "Think",
    icon: <Icon d={P.brain} className="h-3 w-3 text-[var(--accent-on-bg)]" />,
  },
];

const AppWindow = () => {
  const [active, setActive] = useState(0);
  const [model, setModel] = useState(0);
  // Fast or Think is per chat, as in the app: picks by chat index, else the
  // mode its thread ran in
  const [picked, setPicked] = useState({});
  const chat = CHATS[active];
  const think = picked[active] ?? !!chat.thinking;

  return (
    <div
      role="figure"
      aria-label="The Enigmus app window, with five example chats"
      className="relative grid h-[510px] overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--bg)] text-left text-[13px] leading-[1.4] shadow-[0_24px_48px_-28px_rgba(13,111,209,0.35)] dark:shadow-none sm:grid-cols-[200px_1fr] lg:h-[560px] xl:h-[510px]"
    >
      <aside className="hidden min-h-0 flex-col bg-[var(--brand-wash)] sm:flex">
        <div
          aria-hidden="true"
          className="flex h-[52px] shrink-0 items-center justify-between pl-4 pr-3.5 text-[var(--text-dim)]"
        >
          <Lights />
          <span className="flex gap-4">
            <Icon d={P.plus} className="h-[15px] w-[15px]" />
            <Icon d={P.sidebar} className="h-[15px] w-[15px]" />
          </span>
        </div>
        <span
          aria-hidden="true"
          className="mx-2.5 mb-2.5 flex h-[26px] shrink-0 items-center gap-1.5 rounded-[7px] bg-[rgba(118,118,128,0.12)] px-2 text-[var(--text-faint)] dark:bg-[rgba(118,118,128,0.24)]"
        >
          <Icon d={P.search} className="h-[13px] w-[13px]" />
          Search
        </span>
        <span
          aria-hidden="true"
          className="mx-2.5 mb-2 flex shrink-0 items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 leading-[1.2]"
        >
          <Dot className="bg-[#10b981]" />
          <span className="flex-1">
            <span className="block text-[11px]">LLM Server</span>
            <span className="mt-0.5 block text-[10px] text-[var(--text-faint)]">
              Active &middot; port 31415
            </span>
          </span>
          <Icon d={P.right} className="h-3 w-3 text-[var(--text-faint)]" />
        </span>
        {CHATS.map(({ when, messages }, i) => (
          <button
            key={when}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={`group relative mx-2.5 my-0.5 rounded-[10px] border px-2.5 py-2 text-left leading-[1.2] transition-colors duration-150 ${
              i === active
                ? "border-[var(--border)] bg-[var(--surface)]"
                : "border-transparent hover:bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] [&:has(+button:hover)>.chat-hairline]:opacity-0"
            }`}
          >
            <span className="block truncate text-[14.4px]">
              {messages[0][1]}
            </span>
            <span className="mt-0.5 block text-[12.65px] text-[var(--text-dim)]">
              {when}
            </span>
            {/* Hairline under the row, hidden around the raised and hovered ones */}
            {i !== active && i + 1 !== active && i < CHATS.length - 1 && (
              <span className="chat-hairline absolute inset-x-2.5 -bottom-[3.5px] h-px bg-[var(--border)] transition-opacity duration-150 group-hover:opacity-0" />
            )}
          </button>
        ))}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col sm:border-l sm:border-[var(--border)]">
        <div
          aria-hidden="true"
          className="grid h-[52px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-[var(--surface)] px-3.5"
        >
          <Lights className="sm:hidden" />
          <span className="col-start-2 font-semibold text-[var(--text-dim)]">
            Enigmus
          </span>
          <span className="flex justify-end gap-4 text-[var(--text-dim)]">
            <span className="relative">
              <Icon d={P.rack} className="h-[15px] w-[15px]" />
              <Dot className="absolute -right-0.5 -top-0.5 bg-[#10b981]" />
            </span>
            <Icon d={P.gear} className="h-[15px] w-[15px]" />
          </span>
        </div>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 overflow-y-auto text-[15px] [scrollbar-width:none]"
        >
          {chat.messages.map(([from, text, meta], i) =>
            from === "user" ? (
              <div key={i} className="flex justify-end p-4 pl-16">
                <div className="flex flex-col items-start gap-1.5">
                  <span className="rounded-[14px] border border-brand/25 bg-brand/10 px-[10.67px] py-2 text-[#0b5fb3] dark:text-[#d6efff]">
                    {text}
                  </span>
                  <Actions />
                </div>
              </div>
            ) : (
              <div key={i} className="p-4">
                <div className="flex w-[90%] flex-col gap-4 text-[var(--text-muted)]">
                  {meta.thought && (
                    <span className="flex items-center gap-2 italic text-[var(--text-dim)]">
                      <Icon d={P.right} className="h-3 w-3" />
                      Thought for {meta.thought}s
                    </span>
                  )}
                  <div className="flex flex-col gap-[0.75em]">
                    {[].concat(text).map((part, j) => (
                      <Part key={j} part={part} />
                    ))}
                  </div>
                  <Actions tps={meta.tps} />
                </div>
              </div>
            )
          )}
        </div>

        <p
          aria-hidden="true"
          className="px-7 pt-1 text-right text-[10px] tabular-nums text-[var(--text-faint)]"
        >
          Context: {chat.ctx} tokens
        </p>
        <div className="p-2">
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-2">
            <span
              aria-hidden="true"
              className="block px-3 py-2.5 text-[var(--text-faint)]"
            >
              Message
            </span>
            <div className="flex items-center gap-1.5 px-3 pb-2.5 text-[11px]">
              {/* The model is app-wide */}
              <Picker
                options={MODEL_OPTIONS}
                value={model}
                onChange={setModel}
                className="min-w-0"
                chip="inline-flex min-w-0 gap-1.5 rounded-[9px] border border-[var(--border)] px-2.5 py-1.5 hover:border-brand"
              >
                <Dot className="bg-brand" />
                <span className="truncate">{MODELS[model]}</span>
                <Icon
                  d={P.up}
                  className="h-2 w-2 shrink-0 text-[var(--text-faint)]"
                />
              </Picker>
              {/* The mode is per chat. Phones get the glyph alone, as the app does when the row runs out of room */}
              <Picker
                options={MODES}
                value={think ? 1 : 0}
                onChange={(i) => setPicked({ ...picked, [active]: i === 1 })}
                label={`Reasoning: ${MODES[think ? 1 : 0].name}`}
                className="shrink-0"
                chip={`inline-flex gap-1 rounded-full px-2 py-1.5 ${
                  think
                    ? "bg-[var(--brand-wash)] text-[var(--accent-on-bg)] hover:bg-brand/[0.14]"
                    : "text-[var(--text-dim)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                }`}
              >
                <Icon
                  d={think ? P.brain : P.bolt}
                  className={`h-3 w-3 ${think ? "" : "text-[#edb82e]"}`}
                />
                <span className="hidden sm:inline">
                  {think ? "Think" : "Fast"}
                </span>
                <Icon d={P.down} className="h-2 w-2 opacity-60" />
              </Picker>
              <span
                aria-hidden="true"
                className="inline-flex items-center px-2 py-1.5 text-[var(--text-dim)]"
              >
                <Icon d={P.wrench} className="h-3 w-3" />
                <span className="mx-1.5 h-3 w-px bg-[var(--border)]" />
                <Icon d={P.down} className="h-2 w-2 opacity-60" />
              </span>
              <span
                aria-hidden="true"
                className="ml-auto grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-brand text-white opacity-50"
              >
                <Icon d={P.send} className="h-3 w-3" strokeWidth={2.4} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The app's window ring, inset from the frame */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[3px] rounded-[23px] border border-[var(--brand-line)]"
      />
    </div>
  );
};

export default AppWindow;
