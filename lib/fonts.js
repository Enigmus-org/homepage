// IBM Plex Mono, for labels, dates and code. Exposed as a --font-* CSS
// variable on :root in pages/_app.js. The other webfonts, Inter (the SF Pro
// fallback) and Instrument Sans, are in styles/fonts.scss; SF Pro itself is
// the system copy, see tailwind.config.js.
import { IBM_Plex_Mono } from "next/font/google";

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
