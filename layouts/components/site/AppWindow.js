import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// The hero's drawn app window: a mock of the Enigmus chat UI (conversation
// list, model picker, thread, composer), styled like the WebUI. The three
// conversations in the sidebar are buttons that swap the thread, model and
// context counter; the sidebar is hidden on phones, which keep the first.
// Like the app, the thread opens scrolled to its latest message when it is
// taller than the window (narrow widths only).
const THINKING =
  "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z";

const TOOLS = [
  "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm12 8-5-5-9 9", // image
  "M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2", // audio
];

// Each message is [from, text]; a reply may carry a thinking time in seconds.
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
];

const Dot = ({ className }) => (
  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`} />
);

const AppWindow = () => {
  const [active, setActive] = useState(0);
  const chat = CHATS[active];
  const thread = useRef(null);

  useEffect(() => {
    thread.current.scrollTop = thread.current.scrollHeight;
  }, [active]);

  return (
    <div
      role="figure"
      aria-label="The Enigmus chat window, offline, with three example conversations"
      className="grid h-[380px] overflow-hidden rounded-[14px] border border-[var(--brand-line)] bg-[var(--bg)] text-left shadow-[0_24px_48px_-28px_rgba(13,111,209,0.35)] dark:shadow-none sm:grid-cols-[180px_1fr] md:h-[440px]"
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
            <Icon d="M6 9l6 6 6-6" className="h-3 w-3 text-[var(--text-faint)]" />
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
          {chat.messages.map(([from, text, thought]) =>
            from === "user" ? (
              <span
                key={text}
                className="self-end rounded-[14px] border border-brand/25 bg-brand/10 px-3.5 py-2 text-[#0b5fb3] dark:text-[#d6efff]"
              >
                {text}
              </span>
            ) : (
              <div key={text} className="max-w-[90%] text-[var(--text-muted)]">
                {thought && (
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--text-faint)]">
                    <Icon d={THINKING} className="h-3 w-3" />
                    Thought for {thought}s
                  </span>
                )}
                {text}
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
            {TOOLS.map((d) => (
              <Icon key={d} d={d} className="h-3.5 w-3.5" />
            ))}
            <Icon
              d={THINKING}
              className={`h-3.5 w-3.5 ${chat.thinking ? "text-brand" : ""}`}
            />
            <span className="ml-auto font-mono text-[11px]">ctx {chat.ctx}</span>
            <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-brand text-white">
              <Icon d="M12 19V5M5 12l7-7 7 7" className="h-3 w-3" strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppWindow;
