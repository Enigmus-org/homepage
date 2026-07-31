// Renders the post cover SVGs in this directory to 1200x630 WebP.
// Usage, from the repo root:
//   node docs/covers/render.mjs                                        # all, to docs/covers/*.webp
//   node docs/covers/render.mjs diagram public/images/my-cover.webp    # one, to a chosen path
//
// The three variants are alternates for the same post; only one is installed as
// the cover at a time (see the post's `image` frontmatter).
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const variants = {
  diagram: "apple-core-ai-diagram.svg",
  chart: "apple-core-ai-chart.svg",
  terminal: "apple-core-ai-terminal.svg",
};

const [which, out] = process.argv.slice(2);
if (which && !variants[which]) {
  console.error(`unknown variant "${which}" — expected one of: ${Object.keys(variants).join(", ")}`);
  process.exit(1);
}

for (const [name, file] of Object.entries(which ? { [which]: variants[which] } : variants)) {
  // Render at 2x then downsample, so text antialiases cleanly.
  const png = await sharp(join(here, file), { density: 192 })
    .resize(1200, 630, { fit: "fill" })
    .png()
    .toBuffer();
  const target = which && out ? out : join(here, `${name}.webp`);
  const info = await sharp(png).webp({ quality: 92 }).toFile(target);
  console.log(`${target}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
}
