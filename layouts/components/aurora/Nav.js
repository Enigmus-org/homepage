import menu from "@config/menu.json";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Full-width top bar on the flat brand wash, like the WebUI header. Links
// come from the config/menu.json main menu (dropdown entries omitted). The
// link row needs ~1000px, so it appears at lg; smaller widths get a sheet.
const Nav = () => {
  const [open, setOpen] = useState(false);
  const { asPath } = useRouter();
  const links = menu.main.filter((item) => !item.hasChildren);
  const link = (item, size) => (
    <Link
      key={item.name}
      href={item.url}
      onClick={() => setOpen(false)}
      className={`whitespace-nowrap rounded-lg border ${size} ${
        asPath === item.url
          ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
          : "border-transparent hover:text-[var(--text)]"
      }`}
    >
      {item.name}
    </Link>
  );

  return (
    <header className="relative border-b border-[var(--brand-line)] bg-[var(--brand-wash)]">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 md:px-8">
        {/* `priority`: the icon is the topmost image on every page, so it is
            what the LCP measurement lands on and must not be lazy-loaded. */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/enigmus-icon-96.png"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-[8px]"
          />
          <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">
            Enigmus
          </span>
        </Link>

        <nav className="hidden gap-1 text-[14px] text-[var(--text-dim)] lg:flex">
          {links.map((item) => link(item, "px-2.5 py-1.5"))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/download"
            className="hidden h-9 items-center rounded-[10px] bg-[var(--text)] px-4 text-[13.5px] font-medium text-[var(--bg)] hover:opacity-90 lg:flex"
          >
            Download
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="grid h-9 w-9 place-items-center rounded-[10px] text-[var(--text-dim)] lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d={open ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="absolute inset-x-4 top-full z-50 mt-2 flex flex-col gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-2 text-[15px] text-[var(--text-dim)] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.3)] lg:hidden">
          {links.map((item) => link(item, "px-3 py-2.5"))}
        </nav>
      )}
    </header>
  );
};

export default Nav;
