/**
 * Injects per-script CSP hashes into the exported `out/_headers`.
 *
 * Runs automatically as `postbuild`.
 *
 * Next's static export ships the RSC payload as executable inline `<script>`
 * blocks. A static site has no request-time nonce, so without either
 * `'unsafe-inline'` or a hash for each block the browser refuses them and the
 * page never hydrates — silently, because the server-rendered HTML still paints.
 *
 * Hashing keeps `script-src` strict. The output is deterministic, so the hashes
 * are stable for a given build, and `tests/headers.spec.ts` fails the suite if
 * any inline script is ever left unhashed.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'out');
const HEADERS = join(OUT, '_headers');
const PLACEHOLDER = '__INLINE_SCRIPT_HASHES__';

/** Matches `<script>` elements that carry their body inline (no `src`). */
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

/** Every `.html` file under `out/`. */
async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

/**
 * CSP hashes every inline script, including `application/ld+json`: browsers
 * differ on whether non-executable types are exempt, and an extra hash is free.
 */
export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const [, , body] of html.matchAll(INLINE_SCRIPT)) {
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return hashes;
}

export async function collectHashes(outDir = OUT) {
  const all = new Set();
  for (const file of await htmlFiles(outDir)) {
    for (const hash of inlineScriptHashes(await readFile(file, 'utf8'))) all.add(hash);
  }
  return [...all].sort();
}

const hashes = await collectHashes();
const template = await readFile(HEADERS, 'utf8');

if (!template.includes(PLACEHOLDER)) {
  throw new Error(
    `${PLACEHOLDER} is missing from public/_headers — the CSP would ship without ` +
      `script hashes and the site would not hydrate.`,
  );
}

await writeFile(HEADERS, template.replaceAll(PLACEHOLDER, hashes.join(' ')));
console.log(`csp-headers: hashed ${hashes.length} inline script(s) into out/_headers`);
