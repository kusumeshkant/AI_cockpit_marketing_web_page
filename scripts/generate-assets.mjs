/**
 * Renders the static image assets from their SVG sources.
 *
 *   node scripts/generate-assets.mjs
 *
 * Outputs:
 *   public/og-image.png            1200x630 Open Graph card
 *   public/posters/hero-poster.webp  static hero stage for reduced-motion / low-end devices
 *
 * Run this whenever `assets/og-image.svg` changes. The generated files are
 * committed so a clean checkout can build without running sharp.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets', 'og-image.svg');

/** Renders the source SVG to a flat 1200x630 RGB bitmap at 2x for crisp crops. */
async function baseImage() {
  const svg = await readFile(source);
  const png = await sharp(svg, { density: 300 })
    .resize(2400, 1260, { fit: 'fill' })
    .png()
    .toBuffer();
  return png;
}

async function render(outPath, transform) {
  await mkdir(dirname(outPath), { recursive: true });
  const buffer = await transform(sharp(await baseImage()));
  await writeFile(outPath, buffer);
  console.log(`wrote ${outPath.replace(root, '.')} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

await render(join(root, 'public', 'og-image.png'), (img) =>
  img.resize(1200, 630).png({ compressionLevel: 9 }).toBuffer(),
);

// The poster crops to the phone stage on the right of the composition.
// Coordinates are in the 2x space: SVG x 740..1170, y 100..580.
await render(join(root, 'public', 'posters', 'hero-poster.webp'), (img) =>
  img
    .extract({ left: 1480, top: 200, width: 860, height: 960 })
    .resize(688, 768)
    .webp({ quality: 84 })
    .toBuffer(),
);
