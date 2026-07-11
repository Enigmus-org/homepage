// Aurora Glass fonts (from design_handoff_aurora_glass/config/fonts.ts).
// Exposed as --font-* CSS variables on :root in pages/_app.js; the Tailwind
// fontFamily entries display/heading/sans/mono read those variables.
import {
  IBM_Plex_Mono,
  Instrument_Sans,
  Sora,
  Space_Grotesk,
} from "next/font/google";

export const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
