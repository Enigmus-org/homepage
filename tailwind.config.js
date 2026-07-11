const theme = require("./config/theme.json");

let font_base = Number(theme.fonts.font_size.base.replace("px", ""));
let font_scale = Number(theme.fonts.font_size.scale);
let h6 = font_base / font_base;
let h5 = h6 * font_scale;
let h4 = h5 * font_scale;
let h3 = h4 * font_scale;
let h2 = h3 * font_scale;
let h1 = h2 * font_scale;
let fontPrimary, fontPrimaryType, fontSecondary, fontSecondaryType;
if (theme.fonts.font_family.primary) {
  fontPrimary = theme.fonts.font_family.primary
    .replace(/\+/g, " ")
    .replace(/:[ital,]*[ital@]*[wght@]*[0-9,;]+/gi, "");
  fontPrimaryType = theme.fonts.font_family.primary_type;
}
if (theme.fonts.font_family.secondary) {
  fontSecondary = theme.fonts.font_family.secondary
    .replace(/\+/g, " ")
    .replace(/:[ital,]*[ital@]*[wght@]*[0-9,;]+/gi, "");
  fontSecondaryType = theme.fonts.font_family.secondary_type;
}

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
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      colors: {
        text: theme.colors.default.text_color.default,
        dark: theme.colors.default.text_color.dark,
        primary: theme.colors.default.theme_color.primary,
        body: theme.colors.default.theme_color.body,
        border: theme.colors.default.theme_color.border,
        light: theme.colors.default.text_color.light,
        "theme-light": theme.colors.default.theme_color.theme_light,
        "theme-dark": theme.colors.default.theme_color.theme_dark,
        darkmode: {
          text: theme.colors.darkmode.text_color.default,
          light: theme.colors.darkmode.text_color.light,
          dark: theme.colors.darkmode.text_color.dark,
          primary: theme.colors.darkmode.theme_color.primary,
          secondary: theme.colors.darkmode.theme_color.secondary,
          body: theme.colors.darkmode.theme_color.body,
          border: theme.colors.darkmode.theme_color.border,
          "theme-light": theme.colors.darkmode.theme_color.theme_light,
          "theme-dark": theme.colors.darkmode.theme_color.theme_dark,
        },
        // Aurora Glass redesign tokens (design_handoff_aurora_glass)
        brand: {
          DEFAULT: "#1FA3FB",
          deep: "#0D6FD1",
          sky: "#5EC0FF",
          mist: "#9FE0FF",
        },
        violet: "#6D5EF5",
        teal: "#14C7C7",
        ink: {
          900: "#070A12",
          800: "#0C111C",
          700: "#0C1220",
        },
        paper: {
          DEFAULT: "#F4F7FC",
          card: "#FFFFFF",
        },
        slate: {
          fg: "#E8ECF5",
          muted: "#AEB6C6",
          dim: "#9AA3B4",
          faint: "#6B7488",
        },
        graphite: {
          fg: "#0C1220",
          muted: "#46506A",
          dim: "#5A6478",
          faint: "#8A93A6",
        },
      },
      fontSize: {
        base: font_base + "px",
        h1: h1 + "rem",
        "h1-sm": h1 * 0.8 + "rem",
        h2: h2 + "rem",
        "h2-sm": h2 * 0.8 + "rem",
        h3: h3 + "rem",
        "h3-sm": h3 * 0.8 + "rem",
        h4: h4 + "rem",
        h5: h5 + "rem",
        h6: h6 + "rem",
      },
      fontFamily: {
        primary: [fontPrimary, fontPrimaryType],
        secondary: [fontSecondary, fontSecondaryType],
        // Aurora Glass fonts — CSS variables set in pages/_app.js from lib/fonts.js
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "26px",
        panel: "22px",
        nav: "16px",
        btn: "14px",
        chip: "999px",
      },
      backgroundImage: {
        "brand-text": "linear-gradient(120deg,#7FD0FF,#1FA3FB 55%,#6D5EF5)",
        "brand-text-light":
          "linear-gradient(120deg,#0D6FD1,#1FA3FB 50%,#6D5EF5)",
        "brand-btn": "linear-gradient(135deg,#1FA3FB,#0D6FD1)",
        "aurora-blue":
          "radial-gradient(circle,rgba(31,163,251,0.55),transparent 60%)",
        "aurora-violet":
          "radial-gradient(circle,rgba(109,94,245,0.40),transparent 62%)",
        "aurora-teal":
          "radial-gradient(circle,rgba(20,199,199,0.32),transparent 62%)",
        "aurora-blue-l":
          "radial-gradient(circle,rgba(31,163,251,0.30),transparent 60%)",
        "aurora-violet-l":
          "radial-gradient(circle,rgba(109,94,245,0.22),transparent 62%)",
        "aurora-teal-l":
          "radial-gradient(circle,rgba(20,199,199,0.20),transparent 62%)",
      },
      boxShadow: {
        glass: "0 40px 120px -30px rgba(10,25,50,0.6)",
        "glass-light": "0 40px 120px -30px rgba(30,55,100,0.28)",
        "btn-brand": "0 10px 30px rgba(31,163,251,0.45)",
        "card-light": "0 14px 34px -22px rgba(30,55,100,0.4)",
      },
      keyframes: {
        auroraDrift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(26px,-18px) scale(1.12)" },
          "100%": { transform: "translate(0,0) scale(1)" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-9px)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.18" },
        },
      },
      animation: {
        aurora: "auroraDrift 20s ease-in-out infinite",
        "aurora-slow": "auroraDrift 26s ease-in-out infinite reverse",
        "aurora-slower": "auroraDrift 30s ease-in-out infinite",
        float: "floatY 8s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
    require("@tailwindcss/forms"),
    require("tailwind-bootstrap-grid")({ generateContainer: false }),
  ],
};
