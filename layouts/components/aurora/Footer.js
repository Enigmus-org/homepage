import Social from "@components/Social";
import config from "@config/config.json";
import menu from "@config/menu.json";
import social from "@config/social.json";
import { markdownify } from "@lib/utils/textConverter";
import Image from "next/image";
import Link from "next/link";

// Aurora footer (design_handoff_aurora_glass Footer.tsx), data-driven so no
// existing footer content is lost: all menu.json footer links (two columns on
// desktop, flat wrap row on mobile like the mock's 390 frame), the config
// blurb, social icons, and the copyright line.
const COLUMNS = [
  { heading: "Product", links: menu.footer.slice(0, 4) },
  { heading: "Company", links: menu.footer.slice(4) },
];

const Footer = () => {
  const { copyright, footer_content } = config.params;
  return (
    <footer className="relative mt-6 border-t border-[var(--border)] px-[22px] pb-[34px] pt-7 md:mt-14 md:px-14 md:py-11">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col justify-between gap-8 md:flex-row md:gap-10">
        <div className="max-w-[320px]">
          <div className="mb-3 flex items-center gap-2.5 md:mb-3.5">
            <Image
              src="/images/enigmus-icon-96.png"
              alt="Enigmus"
              width={28}
              height={28}
              className="h-[26px] w-[26px] rounded-lg md:h-7 md:w-7"
            />
            <span className="font-heading text-[16px] font-semibold text-[var(--text)]">
              Enigmus
            </span>
          </div>
          {markdownify(
            footer_content,
            "p",
            "text-[13px] leading-[1.6] text-[var(--text-faint)] md:text-[13.5px]"
          )}
          <Social
            source={social}
            className="mt-4 flex gap-3.5 text-[16px] text-[var(--text-dim)]"
          />
        </div>

        {/* link columns — desktop */}
        <div className="hidden gap-14 text-[13.5px] text-[var(--text-muted)] md:flex">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-[11px]">
              <span className="mb-[3px] font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-faint)]">
                {col.heading}
              </span>
              {col.links.map((item) => (
                <Link
                  key={item.name}
                  href={item.url}
                  className="transition-colors hover:text-[var(--text)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* flat link row — mobile */}
        <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-3 text-[13px] text-[var(--text-muted)] md:hidden">
          {menu.footer.map((item) => (
            <Link key={item.name} href={item.url}>
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* copyright */}
      <div className="mx-auto mt-8 w-full max-w-[1200px] md:mt-10">
        {markdownify(
          copyright,
          "p",
          "text-center font-mono text-[11.5px] text-[var(--text-faint)]"
        )}
      </div>
    </footer>
  );
};

export default Footer;
