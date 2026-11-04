// SF Pro, the Apple system face, for all text. Its license rules out
// self-hosting, so the stack names the copy built into Apple systems; no
// system-ui, which would pick Segoe UI or Roboto elsewhere. Other systems get
// Inter (styles/fonts.scss), fetched only there.
const SANS = ["-apple-system", "BlinkMacSystemFont", "'Inter'", "sans-serif"];

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    screens: {
      sm: "540px",
      md: "768px",
      lg: "992px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Enigmus brand blues, from the app icon
        brand: {
          DEFAULT: "#1FA3FB",
          deep: "#0D6FD1",
        },
      },
      fontFamily: {
        sans: SANS,
        // Labels, dates, counters, code: SF Mono where ui-monospace resolves
        // (WebKit: Safari, every iOS browser), the self-hosted IBM Plex Mono
        // elsewhere (styles/fonts.scss)
        mono: ["ui-monospace", "'IBM Plex Mono'", "monospace"],
      },
    },
  },
};
