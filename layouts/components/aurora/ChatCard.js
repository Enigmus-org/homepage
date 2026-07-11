// The glass "on-device conversation" card in the hero
// (design_handoff_aurora_glass ChatCard.tsx). Static designed mockup — can be
// swapped for a real app screenshot. Desktop title bar shows traffic lights,
// mobile a small app-icon header, per the mock's 1440/390 frames.
import Image from "next/image";

const Lock = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1FA3FB"
    strokeWidth="2.2"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const ChatCard = () => (
  // gradient hairline border via padding trick
  <div className="rounded-[20px] bg-gradient-to-b from-white/[0.22] to-white/[0.03] p-px text-left md:rounded-panel">
    <div className="overflow-hidden rounded-[19px] border border-[var(--border)] bg-[var(--chat-surface)] backdrop-blur-[24px] md:rounded-[21px]">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-[15px] py-3 md:gap-2.5 md:px-5 md:py-[15px]">
        <span className="h-[26px] w-[26px] overflow-hidden rounded-[7px] md:hidden">
          <Image
            src="/images/enigmus-icon-96.png"
            alt=""
            width={26}
            height={26}
          />
        </span>
        <span className="hidden h-[11px] w-[11px] rounded-full bg-[#ff5f57] md:block" />
        <span className="hidden h-[11px] w-[11px] rounded-full bg-[#febc2e] md:block" />
        <span className="hidden h-[11px] w-[11px] rounded-full bg-[#28c840] md:block" />
        <span className="font-mono text-[11.5px] font-medium text-[var(--text-faint)] md:ml-3 md:text-[12.5px]">
          <span className="hidden md:inline">
            Enigmus · Gemma&nbsp;4&nbsp;31B · on-device
          </span>
          <span className="md:hidden">Gemma 4 31B</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium text-[#5FCB7F] md:text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          Offline
        </span>
      </div>
      {/* messages */}
      <div className="flex flex-col gap-3 px-[15px] py-[18px] md:gap-4 md:px-6 md:py-[26px]">
        <div className="max-w-[82%] self-end rounded-[15px_15px_4px_15px] bg-brand-btn px-3.5 py-[11px] text-[13.5px] leading-[1.45] text-white md:max-w-[74%] md:rounded-[16px_16px_4px_16px] md:px-[17px] md:py-[13px] md:text-[15px] md:leading-[1.5]">
          <span className="hidden md:inline">Summarize this NDA clause.</span>
          <span className="md:hidden">Summarize this NDA.</span>
        </div>
        <div className="max-w-[90%] self-start rounded-[15px_15px_15px_4px] border border-[var(--border)] bg-[var(--surface-solid)] px-[15px] py-3 text-[13.5px] leading-[1.55] text-[var(--text-muted)] dark:text-[#DCE2EE] md:max-w-[80%] md:rounded-[16px_16px_16px_4px] md:px-[18px] md:py-3.5 md:text-[15px] md:leading-[1.62]">
          <span className="hidden md:inline">
            In short: both parties agree to keep shared information
            confidential for 3 years, with standard carve-outs for anything
            already public.
          </span>
          <span className="md:hidden">
            Both parties keep shared info confidential for 3 years, with
            standard carve-outs.
          </span>
          {/* typing caret */}
          <span
            className="ml-[3px] inline-block h-3.5 w-[7px] translate-y-[2px] animate-blink rounded-sm bg-brand align-baseline md:h-[17px] md:w-2 md:translate-y-[3px]"
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-1.5 pt-1 font-mono text-[10.5px] font-medium text-[var(--text-faint)] md:gap-2 md:text-[12px]">
          <Lock />
          <span className="hidden md:inline">
            Prompt, tokens &amp; history never leave this device
          </span>
          <span className="md:hidden">Never leaves this device</span>
        </div>
      </div>
    </div>
  </div>
);

export default ChatCard;
