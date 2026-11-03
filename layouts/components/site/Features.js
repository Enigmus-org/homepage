import Icon from "./Icon";

// Four facts under the hero, split by hairlines (the 1px grid gap shows the
// border color through). Two columns on phones, four from lg.
const FEATURES = [
  {
    title: "On-device",
    text: "Prompts, replies and history never leave the device.",
    icon: "M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zm1 0V7a4 4 0 0 1 8 0v4",
  },
  {
    title: "Apple MLX",
    text: "Models run on Apple silicon through MLX.",
    icon: "M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4",
  },
  {
    title: "Open-weight models",
    text: "Qwen 3.5 and 3.6, Gemma 4 and others in the model list.",
    icon: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8m-9 5v8",
  },
  {
    title: "Free",
    text: "No account, no telemetry, no analytics.",
    icon: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm-4 9 3 3 5-6",
  },
];

const Features = () => (
  <section className="mx-auto max-w-[1200px] px-4 md:px-8">
    <div className="grid grid-cols-2 gap-px border-b border-[var(--border)] bg-[var(--border)] lg:grid-cols-4">
      {FEATURES.map(({ title, text, icon }) => (
        <div key={title} className="bg-[var(--bg)] px-4 py-6 md:px-6">
          <Icon d={icon} className="mb-3 h-4 w-4 text-[var(--accent-on-bg)]" />
          <h2 className="mb-1.5 text-[14px] font-semibold">{title}</h2>
          <p className="text-[13px] leading-[1.55] text-[var(--text-dim)]">
            {text}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
