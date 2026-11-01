// Webfonts beyond the site's Inter Variable (imported in pages/_app.js):
// only IBM Plex Mono, for labels, dates and code. Exposed as a --font-*
// CSS variable on :root in pages/_app.js.
import { IBM_Plex_Mono } from "next/font/google";

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
