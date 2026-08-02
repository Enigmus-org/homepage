import menu from "@config/menu.json";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Floating glass navigation bar (design_handoff_aurora_glass Nav.tsx).
// Links come from config/menu.json main menu; dropdown entries are omitted —
// the mock nav is a flat four-link row. The desktop link row needs ~1000px to
// fit, so it appears at lg (992px), not md — tablets get the hamburger.
const Nav = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const links = menu.main.filter((item) => !item.hasChildren);

  return (
    <div className="relative flex justify-center px-4 pt-2.5 lg:px-14 lg:pt-[26px]">
      <div className="flex w-full max-w-[1200px] items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 backdrop-blur-xl lg:rounded-nav lg:py-3 lg:pl-[18px] lg:pr-3.5">
        {/* wordmark */}
        <Link href="/" className="flex items-center gap-[9px] lg:gap-[11px]">
          {/* `priority` because the wordmark icon is the topmost image on
              every page — it is what the LCP measurement lands on, so it must
              not be lazy-loaded. */}
          <Image
            src="/images/enigmus-icon-96.png"
            alt="Enigmus"
            width={32}
            height={32}
            priority
            className="h-7 w-7 rounded-lg lg:h-8 lg:w-8 lg:rounded-[9px] lg:shadow-[0_4px_16px_rgba(31,163,251,0.35)]"
          />
          <span className="font-heading text-[16px] font-semibold tracking-[-0.02em] text-[var(--text)] lg:text-[18px]">
            Enigmus
          </span>
        </Link>

        {/* links — desktop only; smaller widths use the hamburger sheet */}
        <nav className="hidden items-center gap-[30px] text-[14.5px] text-[var(--text-muted)] lg:flex">
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              className={`whitespace-nowrap ${
                router.asPath === item.url
                  ? "text-[var(--text)]"
                  : "transition-colors hover:text-[var(--text)]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/download"
            className="hidden items-center gap-2.5 whitespace-nowrap rounded-[11px] bg-brand-btn px-[18px] py-[11px] text-[14px] font-semibold text-white shadow-[0_6px_20px_rgba(31,163,251,0.4)] transition-transform hover:-translate-y-px lg:flex"
          >
            Get Enigmus
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-1 p-1.5 lg:hidden"
          >
            <span className="h-[2px] w-[18px] rounded-[2px] bg-[var(--text-muted)]" />
            <span className="h-[2px] w-[18px] rounded-[2px] bg-[var(--text-muted)]" />
            <span className="h-[2px] w-[18px] rounded-[2px] bg-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* mobile/tablet sheet */}
      {open && (
        // opaque glass: surface tint layered over the page bg so content
        // behind the sheet can't bleed through
        <div className="absolute inset-x-4 top-full z-50 mt-2 rounded-[14px] border border-[var(--border)] p-4 [background:linear-gradient(var(--surface),var(--surface)),linear-gradient(var(--bg),var(--bg))] lg:hidden">
          <nav className="flex flex-col gap-1 text-[15px] text-[var(--text-muted)]">
            {links.map((item) => (
              <Link
                key={item.name}
                href={item.url}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 ${
                  router.asPath === item.url ? "text-[var(--text)]" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <Link
            href="/download"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center rounded-[11px] bg-brand-btn px-[18px] py-[11px] text-[14px] font-semibold text-white shadow-[0_6px_20px_rgba(31,163,251,0.4)]"
          >
            Get Enigmus
          </Link>
        </div>
      )}
    </div>
  );
};

export default Nav;
