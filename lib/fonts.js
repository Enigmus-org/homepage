// Aurora Glass fonts, reduced from the handoff's four families to two to
// keep font payload light: Sora covers both display and heading roles
// (replacing Space Grotesk), and body text reuses the site's existing
// Inter Variable (replacing Instrument Sans). Exposed as --font-* CSS
// variables on :root in pages/_app.js.
import { IBM_Plex_Mono, Sora } from "next/font/google";

export const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
