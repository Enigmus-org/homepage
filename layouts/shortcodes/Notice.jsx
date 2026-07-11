// Aurora glass notice with a type-colored accent. Colors are set inline
// because they vary per type and Tailwind can't compile dynamic classes.
const TYPE_COLORS = {
  note: "#1FA3FB",
  tip: "#5FCB7F",
  info: "#6D5EF5",
  warning: "#FEBC2E",
};

function Notice({ type, children }) {
  const color = TYPE_COLORS[type] || TYPE_COLORS.note;
  return (
    <div
      className="my-5 rounded-[14px] border px-5 pb-1 pt-4"
      style={{ borderColor: `${color}4D`, background: `${color}14` }}
    >
      <div
        className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em]"
        style={{ color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
        {type}
      </div>
      <div className="notice-body">{children}</div>
    </div>
  );
}

export default Notice;
