// Line icon on a 24px grid: one path, stroked in the current text color.
const Icon = ({ d, className = "h-4 w-4", strokeWidth = 1.8 }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

export default Icon;
