// IBM Plex Mono, for labels, dates and code. Exposed as a --font-* CSS
// variable on :root in pages/_app.js. The other webfonts: Inter Variable
// (imported in pages/_app.js), and Inter Display and Instrument Sans
// (styles/fonts.scss). SF Pro is the system copy; see tailwind.config.js.
import { IBM_Plex_Mono } from "next/font/google";

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
