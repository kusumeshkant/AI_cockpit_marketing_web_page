/**
 * Downloads the latin subset of every webfont the site uses into
 * `src/app/fonts/`, so the build never talks to Google.
 *
 *   npm run fonts
 *
 * The files are committed. `next/font/google` fetches at build time, which made
 * `next build` fail on Linux CI inside Turbopack's font pipeline and would have
 * put the same dependency on the Cloudflare Pages build container. Self-hosting
 * makes the build hermetic and reproducible, and is one less third party in the
 * critical path.
 *
 * Re-run this only to change a family or weight, then commit the result.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = join(root, 'src', 'app', 'fonts');

/** A browser UA is required, or the API serves ttf instead of woff2. */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const FAMILIES = [
  { family: 'Archivo', slug: 'archivo', weights: [700, 800] },
  { family: 'IBM Plex Sans', slug: 'ibm-plex-sans', weights: [400, 600] },
  { family: 'IBM Plex Mono', slug: 'ibm-plex-mono', weights: [600] },
];

/** Splits the CSS into `/* subset *\/` comment + @font-face pairs. */
function parseFaces(css) {
  const faces = [];
  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  for (const [, subset, body] of css.matchAll(re)) {
    const weight = /font-weight:\s*(\d+)/.exec(body)?.[1];
    const url = /src:\s*url\(([^)]+)\)/.exec(body)?.[1];
    if (weight && url) faces.push({ subset, weight: Number(weight), url });
  }
  return faces;
}

await mkdir(FONT_DIR, { recursive: true });

for (const { family, slug, weights } of FAMILIES) {
  const spec = `${family.replace(/ /g, '+')}:wght@${weights.join(';')}`;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;

  const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${family}: CSS request failed (${res.status})`);
  const css = await res.text();

  const faces = parseFaces(css).filter((f) => f.subset === 'latin');

  const missing = weights.filter((w) => !faces.some((f) => f.weight === w));
  if (missing.length) throw new Error(`${family}: no latin face for weight ${missing.join(', ')}`);

  // All three families are variable, so every requested weight resolves to the
  // same file and one download covers the range. If Google ever serves static
  // instances instead, fail loudly rather than silently shipping one weight.
  const urls = new Set(faces.filter((f) => weights.includes(f.weight)).map((f) => f.url));
  if (urls.size !== 1) {
    throw new Error(
      `${family}: expected one variable latin file, got ${urls.size}. ` +
        `Update this script and layout.tsx to declare a file per weight.`,
    );
  }

  const [url] = urls;
  const font = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!font.ok) throw new Error(`${family}: download failed (${font.status})`);
  const bytes = Buffer.from(await font.arrayBuffer());

  await writeFile(join(FONT_DIR, `${slug}.woff2`), bytes);
  console.log(`${slug}.woff2  ${(bytes.length / 1024).toFixed(1)} KB  (weights ${weights.join('–')})`);
}

console.log(`\nWrote to ${FONT_DIR.replace(root, '.')}`);
