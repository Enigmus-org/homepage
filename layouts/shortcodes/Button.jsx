import Link from "next/link";

const Button = ({ href, type, rel, children }) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel={`noopener noreferrer ${
        rel ? (rel === "follow" ? "" : rel) : "nofollow"
      }`}
      className={`mb-4 me-4 inline-flex items-center rounded-[11px] px-[18px] py-[11px] text-[14px] font-semibold no-underline transition-transform hover:-translate-y-px hover:no-underline ${
        type === "outline"
          ? "border border-[var(--border)] bg-[var(--surface)] !text-[var(--text)] backdrop-blur-md"
          : "bg-brand-btn !text-white shadow-[0_6px_20px_rgba(31,163,251,0.4)]"
      }`}
    >
      {children}
    </Link>
  );
};

export default Button;
