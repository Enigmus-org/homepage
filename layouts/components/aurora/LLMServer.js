import CodeBlock from "@layouts/shortcodes/CodeBlock";
import { MacBookFrame } from "./DeviceFrames";
import Icon from "./Icon";

// Homepage LLM Server section, in three parts: the Mac on its server screen
// beside the intro and a curl call, a flat diagram of where requests go, and
// a hairline row of use cases. Facts follow the app's docs/chat-server.md,
// docs/server-web-ui.md and docs/tool-calling.md; the privacy policy carries
// the same no-password caveat.

const ARROW = "M5 12h14m-5-5 5 5-5 5";

// Hand-tokenized with the terminal block's GitHub Dark classes, since the
// build-time highlighter only runs on MDX content. No line runs past 50
// characters, the width CURL_FIT is sized for; the copy button copies the
// text exactly as laid out here.
const CURL = (
  <code className="language-bash">
    <span className="sh-cmd">curl</span>
    {" http://127.0.0.1:31415/v1/chat/completions \\\n  "}
    <span className="sh-flag">-H</span>{" "}
    <span className="hljs-string">{'"Content-Type: application/json"'}</span>
    {" \\\n  "}
    <span className="sh-flag">-d</span>{" "}
    <span className="hljs-string">
      {`'{"model": "enigmus", "messages": [\n        {"role": "user", "content": "Hi"}]}'`}
    </span>
  </code>
);

// Phones: the code scales with the viewport so a 50-character line fits from
// a 320px screen up, and the block's side padding tightens; 13px from ~490px.
const CURL_FIT =
  "[&_pre]:!px-3 [&_pre]:!text-[length:clamp(8.5px,2.65vw,13px)] sm:[&_pre]:!px-4";

const Node = ({ label, title, detail, items, dashed, live }) => (
  <div
    className={`rounded-[10px] border bg-[var(--surface)] p-4 ${
      dashed
        ? "border-dashed border-black/20 dark:border-white/20"
        : "border-[var(--border)]"
    }`}
  >
    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
      {label}
    </p>
    <p className="mt-1.5 flex items-center gap-2 text-[14px] font-semibold">
      {live && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
      {title}
    </p>
    {detail && (
      <p className="mt-0.5 font-mono text-[12px] text-[var(--accent-on-bg)]">
        {detail}
      </p>
    )}
    <ul className="mt-3 space-y-1 text-[13px] leading-[1.5] text-[var(--text-dim)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const Arrow = () => (
  <div className="flex justify-center text-[var(--text-faint)]">
    <Icon d={ARROW} className="h-5 w-5 rotate-90 md:rotate-0" />
  </div>
);

const Mono = ({ children }) => (
  <span className="font-mono text-[12px] text-[var(--text)]">{children}</span>
);

const USES = [
  {
    title: "Scripts and notebooks",
    icon: "M8 7l-5 5 5 5m8-10 5 5-5 5",
    text: (
      <>
        The <Mono>openai</Mono> SDK works with its base URL set to the server.
        The model name <Mono>enigmus</Mono> always means the loaded model.
      </>
    ),
  },
  {
    title: "Coding agents",
    icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm3 5 3 2-3 2m5 0h4",
    text: "Tool calling is served on Qwen 3.5 2B and up and on Qwen 3.6, so agents built on the OpenAI chat API, opencode among them, run against a local model. Source code stays on the machine.",
  },
  {
    title: "Browser chat",
    icon: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z",
    text: (
      <>
        A web chat is served at <Mono>/</Mono> on the same port. Any browser
        that can reach the address gets a chat page with nothing to install;
        its conversations stay in that browser.
      </>
    ),
  },
  {
    title: "Mac as the model host",
    icon: "M5 5h14a1 1 0 0 1 1 1v9H4V6a1 1 0 0 1 1-1zM2 19h20",
    text: "With Allow Network Access, an iPad or iPhone on the same network can use a model too large for its own memory, served from a Mac that stays out of idle sleep while serving.",
  },
];

const LLMServer = () => (
  <section className="mx-auto max-w-[1200px] px-4 pt-20 md:px-8 md:pt-28">
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_500px] lg:gap-12">
      <MacBookFrame
        src="/images/home-mac-server"
        height={1150}
        alt="Enigmus on Mac - the LLM Server settings, active on port 31415, with the completion endpoint and web chat URLs"
        sizes="(min-width: 992px) 640px, 92vw"
        className="w-full max-w-[640px]"
      />
      <div className="min-w-0">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
          OpenAI-compatible API
        </p>
        <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
          LLM Server for macOS and iOS
        </h2>
        <p className="mt-2 text-[15px] leading-[1.65] text-[var(--text-muted)]">
          Enigmus can serve the loaded model over an OpenAI-compatible API on
          the device itself. Scripts, coding agents and browsers send requests
          to a local address, the same MLX engine as the in-app chat generates
          the reply, and nothing passes through a cloud service. The server is
          off by default.
        </p>
        <div className={`mt-6 [&_.terminal-block]:my-0 ${CURL_FIT}`}>
          <CodeBlock copy>{CURL}</CodeBlock>
        </div>
      </div>
    </div>

    <figure className="mt-14">
      <figcaption className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
        Where requests go
      </figcaption>
      <div className="grid items-center gap-3 md:grid-cols-[1fr_28px_1fr_28px_1fr]">
        <div className="grid gap-3">
          <Node
            label="Same device"
            title="Clients"
            items={["Scripts and notebooks", "Coding agents", "Browser"]}
          />
          <Node
            dashed
            label="Local network"
            title="Other devices"
            items={["Only with Allow Network Access"]}
          />
        </div>
        <Arrow />
        <Node
          live
          label="Enigmus"
          title="LLM Server"
          detail="127.0.0.1:31415"
          items={[
            "POST /v1/chat/completions",
            "GET /v1/models",
            "GET / - web chat",
          ]}
        />
        <Arrow />
        <Node
          label="MLX"
          title="Loaded model"
          items={[
            "One model at a time",
            "Shared with the in-app chat",
            "Runs on the same device",
          ]}
        />
      </div>
      <p className="mt-4 max-w-[820px] text-[13px] leading-[1.6] text-[var(--text-dim)]">
        Every launch starts with the server off and bound to 127.0.0.1. Allow
        Network Access opens it to the local network, and the server has no
        password, so that is for trusted networks only. On iPhone and iPad,
        locking the screen or switching apps pauses it; on the Mac it keeps
        serving in the background.
      </p>
    </figure>

    <div className="mt-14 grid gap-px border-y border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
      {USES.map(({ title, icon, text }) => (
        <div key={title} className="bg-[var(--bg)] px-4 py-6 md:px-6">
          <Icon d={icon} className="mb-3 h-4 w-4 text-[var(--accent-on-bg)]" />
          <h3 className="mb-1.5 text-[14px] font-semibold">{title}</h3>
          <p className="text-[13px] leading-[1.55] text-[var(--text-dim)]">
            {text}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default LLMServer;
