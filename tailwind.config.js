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
        // Enigmus brand blues (app icon) and the older accent palette
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
        // Inter Variable for UI, headings and cards (as in the WebUI); IBM
        // Plex Mono for labels (see lib/fonts.js)
        display: ["'Inter Variable'", "system-ui", "sans-serif"],
        heading: ["'Inter Variable'", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
        // SF Pro for the hero and prose text. Its license rules out
        // self-hosting, so these name the copy built into Apple systems; no
        // system-ui here, which would pick Segoe UI or Roboto elsewhere.
        // Other systems get Inter: Inter Display for the hero
        // (styles/fonts.scss, fetched only there), the already loaded Inter
        // Variable for prose.
        "sf-display": ["-apple-system", "BlinkMacSystemFont", "'Inter Display'", "sans-serif"],
        "sf-text": ["-apple-system", "BlinkMacSystemFont", "'Inter Variable'", "sans-serif"],
        // The chat view (AppWindow); styles/fonts.scss
        chat: ["'Instrument Sans'", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "26px",
        panel: "22px",
        nav: "16px",
        btn: "14px",
        chip: "999px",
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
