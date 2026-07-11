import { useState } from "react";

const Accordion = ({ title, children, className }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className={`mb-3.5 overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface-solid)] [box-shadow:var(--shadow-card)] ${
        className || ""
      }`}
    >
      <button
        type="button"
        className="relative block w-full px-5 py-4 pr-12 text-left font-heading text-[15.5px] font-semibold text-[var(--text)]"
        onClick={() => setShow(!show)}
      >
        {title}
        <svg
          className={`absolute right-5 top-1/2 m-0 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-faint)] transition-transform ${
            show ? "rotate-180" : ""
          }`}
          x="0px"
          y="0px"
          viewBox="0 0 512.011 512.011"
          xmlSpace="preserve"
        >
          <path
            fill="currentColor"
            d="M505.755,123.592c-8.341-8.341-21.824-8.341-30.165,0L256.005,343.176L36.421,123.592c-8.341-8.341-21.824-8.341-30.165,0 s-8.341,21.824,0,30.165l234.667,234.667c4.16,4.16,9.621,6.251,15.083,6.251c5.462,0,10.923-2.091,15.083-6.251l234.667-234.667 C514.096,145.416,514.096,131.933,505.755,123.592z"
          />
        </svg>
      </button>
      <div
        className={`px-5 pb-4 text-[var(--text-muted)] ${!show && "hidden"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Accordion;
