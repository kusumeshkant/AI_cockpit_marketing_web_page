/**
 * Finishes `out/_headers` after the static export.
 *
 * Runs automatically as `postbuild`. Two substitutions:
 *
 * `__INLINE_SCRIPT_HASHES__` — Next's static export ships the RSC payload as
 * executable inline `<script>` blocks. A static site has no request-time nonce,
 * so without either `'unsafe-inline'` or a hash per block the browser refuses
 * them and the page never hydrates — silently, because the server-rendered HTML
 * still paints. Hashing keeps `script-src` strict, and the output is
 * deterministic so the hashes are stable for a given build.
 *
 * `__NOINDEX_HEADER__` — an `X-Robots-Tag` line while `NEXT_PUBLIC_NOINDEX` is
 * `"true"`, removed entirely otherwise. It belongs in the response rather than
 * only in the markup so non-HTML responses are covered too.
 *
 * `tests/headers.spec.ts` fails the suite if any inline script is left
 * unhashed, or if a placeholder survives into the build.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'out');
const HEADERS = join(OUT, '_headers');

const HASH_TOKEN = '__INLINE_SCRIPT_HASHES__';
const NOINDEX_TOKEN = '__NOINDEX_HEADER__';

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

async function collectHashes(outDir = OUT) {
  const all = new Set();
  for (const file of await htmlFiles(outDir)) {
    for (const hash of inlineScriptHashes(await readFile(file, 'utf8'))) all.add(hash);
  }
  return [...all].sort();
}

const noindex = process.env.NEXT_PUBLIC_NOINDEX === 'true';
const hashes = await collectHashes();
const template = await readFile(HEADERS, 'utf8');

for (const token of [HASH_TOKEN, NOINDEX_TOKEN]) {
  if (!template.includes(token)) {
    throw new Error(`${token} is missing from public/_headers — the built policy would be wrong.`);
  }
}

const finished = template
  .split('\n')
  .flatMap((line) => {
    // Only the standalone placeholder line, never the mention in the comment.
    if (line.trim() === NOINDEX_TOKEN) {
      return noindex ? ['  X-Robots-Tag: noindex, nofollow'] : [];
    }
    // Only inside the policy itself, for the same reason.
    if (line.trimStart().startsWith('Content-Security-Policy:')) {
      return [line.replace(HASH_TOKEN, hashes.join(' '))];
    }
    return [line];
  })
  .join('\n');

await writeFile(HEADERS, finished);

console.log(
  `headers: ${hashes.length} inline script hash(es); ` +
    `X-Robots-Tag ${noindex ? 'added (noindex)' : 'omitted (indexable)'}`,
);
