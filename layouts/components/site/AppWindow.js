import Icon from "./Icon";

// The hero's drawn app window: a static mock of the Enigmus chat UI
// (conversation list, model picker, one exchange, composer), styled like the
// WebUI. Exposed to assistive tech as a single image; the conversation list
// is hidden on phones.
const CHATS = [
  ["NDA clause summary", "just now"],
  ["Trip packing list", "yesterday"],
  ["Explain MLX quantization", "2 days ago"],
];

const TOOLS = [
  "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm12 8-5-5-9 9", // image
  "M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2", // audio
  "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", // thinking
];

const Dot = ({ className }) => (
  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`} />
);

const AppWindow = () => (
  <div
    role="img"
    aria-label="The Enigmus chat window, offline, with Gemma 4 31B summarizing an NDA clause on-device"
    className="grid h-[380px] overflow-hidden rounded-[14px] border border-[var(--brand-line)] bg-[var(--bg)] text-left shadow-[0_24px_48px_-28px_rgba(13,111,209,0.35)] dark:shadow-none sm:grid-cols-[180px_1fr] md:h-[440px]"
  >
    <aside className="hidden flex-col gap-1.5 border-r border-[var(--border)] bg-[var(--brand-wash)] p-2.5 text-[11.5px] sm:flex">
      <span className="mb-1 flex items-center justify-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] py-2 text-[var(--text-dim)]">
        <Icon d="M12 5v14M5 12h14" className="h-3 w-3" />
        New Chat
      </span>
      {CHATS.map(([title, when], i) => (
        <span
          key={title}
          className={`rounded-[10px] border px-2.5 py-2 ${
            i
              ? "border-transparent"
              : "border-[var(--border)] bg-[var(--surface)]"
          }`}
        >
          {title}
          <span className="mt-0.5 block text-[10px] text-[var(--text-faint)]">
            {when}
          </span>
        </span>
      ))}
    </aside>

    <div className="flex min-w-0 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
        <span className="inline-flex items-center gap-2 rounded-[9px] border border-[var(--border)] px-2.5 py-1.5 text-[12.5px]">
          <Dot className="bg-brand" />
          Gemma 4 31B
          <Icon d="M6 9l6 6 6-6" className="h-3 w-3 text-[var(--text-faint)]" />
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-faint)]">
          <Dot className="bg-[#10b981]" />
          Offline
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-5 text-[13.5px] leading-[1.6]">
        <span className="self-end rounded-[14px] border border-brand/25 bg-brand/10 px-3.5 py-2 text-[#0b5fb3] dark:text-[#d6efff]">
          Summarize this NDA clause.
        </span>
        <span className="max-w-[90%] text-[var(--text-muted)]">
          In short: both parties agree to keep shared information confidential
          for 3 years, with standard carve-outs for anything already public.
        </span>
      </div>

      <div className="mx-4 mb-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 pb-2 pt-2.5">
        <span className="text-[13px] text-[var(--text-faint)]">
          Type a message...
        </span>
        <div className="mt-2.5 flex items-center gap-3 text-[var(--text-faint)]">
          {TOOLS.map((d) => (
            <Icon key={d} d={d} className="h-3.5 w-3.5" />
          ))}
          <span className="ml-auto font-mono text-[11px]">ctx 412/8.2k</span>
          <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-brand text-white">
            <Icon d="M12 19V5M5 12l7-7 7 7" className="h-3 w-3" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default AppWindow;
