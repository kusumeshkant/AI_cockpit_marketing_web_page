# AI Cockpit — marketing site

The single-page marketing site for **AI Cockpit**: a dark, 3D-feeling landing page whose only
job is to get AI automation consultants and agencies to **book a demo**.

Built to [`docs/marketing-site-spec.md`](docs/marketing-site-spec.md) (the code-ready spec).
The Figma file is visual reference only. Where the shipped site departs from the spec, see
[Deviations from spec](#deviations-from-spec).

---

## Stack

| Concern           | Choice                                                                        |
| ----------------- | ----------------------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router), **static export** (`output: 'export'`)               |
| Language          | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess`                         |
| Styling           | Tailwind CSS 4 — tokens declared once in `src/app/globals.css` under `@theme` |
| Foreground motion | Framer Motion (`motion` v13), loaded lazily — see [Performance](#performance) |
| Background 3D     | `three` + `@react-three/fiber` + `@react-three/drei`, lazy + desktop only     |
| Fonts             | `next/font/google` — Archivo, IBM Plex Sans, IBM Plex Mono                    |
| Tests             | Playwright (desktop / mobile / reduced-motion projects)                       |

> **No `tailwind.config.ts`.** Tailwind 4 is CSS-first: the design tokens live in the `@theme`
> block of `globals.css` and are emitted as CSS variables, so they are usable both as utilities
> (`bg-surface`, `text-h2`) and as `var(--color-surface)` from TypeScript. `src/styles/tokens.ts`
> mirrors the raw values for consumers that cannot read CSS — three.js materials and the asset
> generator. Those two files must be kept in sync; both match the Flutter app's `AppColors` dark theme.

---

## Getting started

```bash
cd product/marketing_page
npm install
cp .env.example .env.local     # optional: site URL, noindex, Turnstile key
npm run dev                    # http://localhost:3000
```

### Scripts

| Script                 | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Dev server with Turbopack                                               |
| `npm run build`        | Production build + static export to `out/`                              |
| `npm start`            | Serves the built `out/` directory locally                               |
| `npm run lint`         | ESLint + `tsc --noEmit`                                                 |
| `npm run format`       | Prettier over the repo                                                  |
| `npm run assets`       | Regenerates `public/og-image.png` and `public/posters/hero-poster.webp` |
| `npm run test:install` | One-time Playwright browser download                                    |
| `npm run test`         | Playwright smoke suite (builds are expected in `out/` first)            |

`npm run test` serves `out/`, so run `npm run build` before it.

---

## Environment variables

| Variable               | Required       | Purpose                                                                                                                                                                                               |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | For production | Absolute origin, used for the canonical URL and Open Graph tags. **No fallback:** when unset, the canonical, `og:url` and the social-card image are omitted rather than pointing at a guessed domain. |
| `NEXT_PUBLIC_NOINDEX`  | Staging only   | `"true"` emits `<meta name="robots" content="noindex, nofollow">` and a `robots.txt` containing `Disallow: /`. Anything else (including unset) leaves the site indexable.                             |

All of these are inlined at build time, so **a change requires a rebuild**, not just a redeploy
of `out/`. Copy `.env.example` to `.env.local` to set them for local development.

The demo request endpoint also needs runtime secrets, which never appear in the repository —
see [Demo inquiries](#demo-inquiries).

---

## Editing content

**All user-facing copy lives in `src/content/site.ts`.** Components never hard-code strings.
To change a headline, a price or a FAQ answer, edit that file only — the FAQ JSON-LD in
`src/app/layout.tsx` is generated from the same data, so structured data cannot drift from
the page.

Likewise, no component hard-codes a colour or a size: everything comes from the `@theme`
tokens (`bg-surface`, `text-h2`, `rounded-(--radius-panel)`, `shadow-(--shadow-deep)`, …).

---

## Demo inquiries

The only server-side code on the site: `functions/api/inquiry.ts`, a Cloudflare Pages Function.
The site itself stays a static export.

A visitor fills the form — in the dialog behind any "Request a demo" CTA, or in the
`#request-demo` section — and the endpoint stores the submission in Cloudflare D1 and emails a
notification. There is no calendar booking; you follow up yourself.

### The request path

1. **Method, size, origin.** POST only, 10 KB cap, `Origin` must match the request host.
2. **Unknown fields are rejected** outright.
3. **Spam signals** — a honeypot field and a minimum time-to-submit. Both answer with a normal
   `200 {ok:true}` so a bot learns nothing about which check caught it, and nothing is stored.
4. **Turnstile** is verified server-side, before anything is written.
5. **Validation** runs the same rules as the browser, from `src/lib/inquiry.ts`.
6. **Rate limit** — 5 per IP per hour, counted against a salted SHA-256 hash. The raw address is
   never stored.
7. **Insert**, then **email**. A failed email still returns success, because the row is safe and
   the inquiry must not be lost.

Responses: `200 {ok:true}` · `400 {ok:false, errors}` · `403 turnstile_failed` ·
`405 method_not_allowed` · `413 payload_too_large` · `429 rate_limited` ·
`500 server_misconfigured` · `500 server`.

### Production and previews are not equivalent

The endpoint reads `CF_PAGES_BRANCH`, which Cloudflare injects at runtime.

|                | Production (`main`)                           | Preview (any other branch)                         |
| -------------- | --------------------------------------------- | -------------------------------------------------- |
| Missing secret | **500 `server_misconfigured`** — fails closed | Runs                                               |
| Turnstile      | **Always verified**                           | Skipped _only_ if `TURNSTILE_SECRET_KEY` is absent |
| Email subject  | `New demo request — …`                        | `[PREVIEW] New demo request — …`                   |

Production requires all four of `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`
and `INQUIRY_TO_EMAIL`. If any is missing the endpoint refuses to run rather than quietly
accepting unverified submissions or losing them because no email can be sent. Only the code
`inquiry:server_misconfigured` is logged — never which secret is missing.

**An absent branch name counts as production.** If we cannot prove a deployment is a preview it
gets the strict path. For `wrangler pages dev`, put `CF_PAGES_BRANCH=local` in `.dev.vars` to get
preview behaviour.

**Turnstile should be on in previews too.** A Turnstile hostname covers its subdomains, so the
widget hostname `ai-cockpit-12h.pages.dev` already matches every preview URL
(`<hash>.ai-cockpit-12h.pages.dev`). Set `TURNSTILE_SECRET_KEY` for the preview environment as
well; the skip exists as a safety valve, not as the normal state.

Nothing a visitor typed is ever logged — not names, phones, emails or messages. The only thing
written to the console is a short non-PII code such as `inquiry:rate_limited`.

### Secrets and bindings

Set as Cloudflare Pages secrets (each prompts, so the value never reaches a shell history):

```bash
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name ai-cockpit
wrangler pages secret put RESEND_API_KEY       --project-name ai-cockpit
wrangler pages secret put INQUIRY_TO_EMAIL     --project-name ai-cockpit
wrangler pages secret put INQUIRY_FROM_EMAIL   --project-name ai-cockpit
wrangler pages secret put IP_HASH_SALT         --project-name ai-cockpit   # optional
```

Wrangler asks which environment each secret belongs to. Set them for **both** production and
preview — run the command twice — or previews will fall back to the skip path.

Both email addresses come from the environment, so neither appears in this public repository.
`IP_HASH_SALT` is optional; without it the Turnstile secret is used as the salt.

`wrangler.toml` declares the D1 binding `DB` and nothing else — it does not switch the project
to a Worker build.

### Database

`ai-cockpit-inquiries` already exists and its id is in `wrangler.toml`. To recreate it from
scratch:

```bash
wrangler d1 create ai-cockpit-inquiries          # then paste the id into wrangler.toml
wrangler d1 execute ai-cockpit-inquiries --remote --file migrations/0001_create_inquiry.sql
```

The `functions/` directory and `wrangler.toml` must be present when `wrangler pages deploy`
runs, or the deployment ships static assets only and `/api/inquiry` answers 405. The CI deploy
job sparse-checks them out for exactly this reason.

### Reading new inquiries

```bash
# The 20 most recent, newest first
wrangler d1 execute ai-cockpit-inquiries --remote --command   "SELECT id, created_at, name, phone, email, company, role, tools, best_time, message
     FROM inquiry ORDER BY created_at DESC LIMIT 20"

# Just the count for today
wrangler d1 execute ai-cockpit-inquiries --remote --command   "SELECT COUNT(*) FROM inquiry WHERE created_at > date('now')"
```

Retention is 12 months (see `/privacy`). To honour a deletion request:

```bash
wrangler d1 execute ai-cockpit-inquiries --remote --command   "DELETE FROM inquiry WHERE id = <id>"
```

### Privacy page

`/privacy` explains what the form collects, why, where it is stored and how to have it deleted.
It is currently marked **Draft — review before public launch**, and it deliberately names no
email address: it tells people to reply to any message they have had from us.

---

## Architecture

```
src/
  app/            layout (fonts, metadata, JSON-LD), page (section order), globals.css (tokens)
  content/site.ts every string and link on the site
  styles/tokens.ts token values mirrored for TS (three.js, asset generation)
  components/
    ui/           Button, Pill, Eyebrow, Container, Section, Logo, icons/, cn
    mock/         PhoneFrame, ActionCard, PushBanner, FeedScreen, DetailScreen
    motion/       MotionRoot (LazyMotion), features (lazy feature bundle), useInView
    three/        HeroScene + OrbitRing / AgentNode / SignalParticles, capability hooks
    inquiry/      RequestDemoButton (every CTA), DemoModalHost (lazy dialog),
                  InquiryForm, Turnstile, demoModalStore
    sections/     Nav, Hero, Platforms, Problem, HowItWorks, ApproveMoment, UseCases,
                  Consultants, Security, Pricing, Faq, RequestDemo, FinalCta,
                  Footer, StickyCta
                  — plus the client leaves the server sections mount:
                  HeroStage, TiltCard, and the lazy scroll layers
                  ProblemStage / HowItWorksStage / ApproveStage
    DemoModal.tsx, WatchDemoButton.tsx
  lib/inquiry.ts  validation shared by the form and the Pages Function
functions/
  api/inquiry.ts  the demo request endpoint (Cloudflare Pages Function)
migrations/       D1 schema
tests/            smoke.spec.ts · headers.spec.ts · inquiry-form.spec.ts (browser)
                  inquiry-schema.spec.ts · inquiry-api.spec.ts (no browser)
assets/og-image.svg    source artwork for the generated images
scripts/generate-assets.mjs
```

### Depth planes

- **Back** — HUD grid, radial glow, and the R3F canvas (orbit ring, agent nodes, signal particles).
- **Middle** — glass cards, the push banner.
- **Front** — the phone, headline and CTAs. Always plain DOM, so text stays crisp and selectable.

---

## Performance

### Lighthouse

```bash
npm run build && npm run lighthouse
```

The script serves `out/` on a local port, audits it as mobile and desktop, writes the full
reports to `lighthouse/` and prints the spread across runs. Each form factor runs 3 times by
default and the **median** is reported — Lighthouse's simulated throttling swings by several
hundred milliseconds on a busy machine, so a single run is not a pass/fail signal. Override
with `LH_RUNS=5 npm run lighthouse`.

**Two modes.** Against a local origin the script runs in `local` mode: Performance and LCP
misses print as `WARN` and it still exits 0. Every other budget — accessibility, best
practices, SEO, CLS — is enforced in both modes.

```bash
npm run lighthouse                                      # local  → warns on perf/LCP
npm run lighthouse -- --url https://aicockpit.dqstore.in # strict → fails on anything
npm run lighthouse -- --strict                          # force strict locally
```

`--url` pointing anywhere other than localhost switches to `strict` automatically, because on a
real host the variables below are no longer a confound.

Latest median of 5, against the production static export:

|                  | Perf | A11y | Best practices | SEO  | LCP       | CLS    | TBT    |
| ---------------- | ---- | ---- | -------------- | ---- | --------- | ------ | ------ |
| **Mobile**       | 89   | 100  | 100            | 100  | 2764 ms   | 0.000  | 326 ms |
| **Desktop**      | 100  | 100  | 100            | 100  | 592 ms    | 0.000  | 38 ms  |
| Target (spec §2) | ≥ 90 | ≥ 95 | ≥ 95           | ≥ 95 | < 2500 ms | < 0.05 | —      |

Accessibility, best practices, SEO, CLS and desktop performance all clear the bar. Mobile
performance sits at the threshold (spread across runs: 76 / 89 / 89 / 91 / 91) and mobile LCP
reads ~2.76 s, both driven by the same thing: **the local harness, not the page.**

A control page served from the same local server — one `<h1>`, one inline `<style>`, no
JavaScript, no fonts, no images — measures **LCP 2788 ms** under the same mobile profile. The
full marketing site measures 2764 ms. In other words the page adds nothing measurable over an
empty document; the number is Lantern's simulation of connection setup against a plain
HTTP/1.1 origin with no CDN, no HTTP/2 and no cache headers. The _observed_ (unthrottled) LCP
in the same trace is **172 ms**.

Re-measure against the real deployment before treating mobile LCP as a defect: a CDN host
(Cloudflare Pages, Vercel) gives HTTP/2 or /3, edge termination and immutable caching for
`/_next/static/*`, none of which `serve` provides.

### Bundle budget

The spec's budget is **≤ 180 KB gzip of initial JS**, excluding the lazy 3D chunk. The build
lands at **150 KB** because neither animation library is on the critical path:

| Layer                                                | gzip         | When it loads                             |
| ---------------------------------------------------- | ------------ | ----------------------------------------- |
| React + React DOM + Next App Router runtime          | 130.5 KB     | initial                                   |
| Site code (all 13 sections, server-rendered)         | 19.2 KB      | initial                                   |
| **Initial total**                                    | **149.7 KB** |                                           |
| Framer Motion (core + `domAnimation` + scroll hooks) | 35.4 KB      | on scroll, per scene                      |
| three.js + R3F + drei                                | 250.5 KB     | desktop only, after `requestIdleCallback` |

How that is achieved:

1. **The hero uses no animation runtime at all.** `Hero` is a server component; its entrance,
   the idle phone float and the push-banner drop are CSS keyframes. Only `HeroStage` and the
   "Watch 60-sec demo" button hydrate.
2. **Scroll scenes are split.** `Problem`, `HowItWorks` and `ApproveMoment` each server-render a
   complete static layer, then swap in a `next/dynamic({ ssr: false })` animated layer once an
   `IntersectionObserver` reports the section is within 800px of the viewport. The copy is always
   in the HTML — the deferral costs nothing in SEO.
3. **`LazyMotion` + `m` components.** Every animated element uses `m.*` from `motion/react-m`
   (the mini bundle), with the feature set behind `() => import('./features')`. `strict` mode
   makes a stray `motion.*` import a runtime error.
4. **Most sections never hydrate.** Platforms, Problem copy, Security, Consultants, Pricing,
   FAQ, Final CTA and Footer are server components. The FAQ is native `<details>`; the marquee,
   check-draw and bubble stagger are CSS keyframes; Use cases hydrates only a tilt leaf.
5. **CSS is inlined** (`experimental.inlineCss`), removing a render-blocking request, and the
   font set is trimmed to the weights actually used, with mono excluded from preload.
6. **Below-the-fold reveals are CSS view timelines** (`animation-timeline: view()`), falling
   back to an on-load animation where they are unsupported. Security and Consultants animate
   on scroll without hydrating.

### Content Security Policy

Next's static export ships the RSC payload as inline `<script>` blocks, and a static site has no
request-time nonce. `npm run build` therefore runs `scripts/headers.mjs` as a `postbuild`
step: it hashes every inline script in `out/` and substitutes them into the `script-src` of
`out/_headers`, so the policy needs no `'unsafe-inline'`. The same step adds
`X-Robots-Tag: noindex, nofollow` while `NEXT_PUBLIC_NOINDEX` is `true`, and omits it
otherwise.

`tests/headers.spec.ts` fails the suite if any inline script is left unhashed. Without it the
site hydrates fine locally — `serve` ignores `_headers` — and silently fails to hydrate on
Cloudflare.

Two tests keep this honest: one asserts that no script referenced by the initial HTML contains
Framer Motion or three.js, and another asserts the motion chunk _does_ arrive once you scroll.

### 3D and reduced motion

The WebGL canvas renders only when **all** of these hold: viewport ≥ 768px, WebGL available,
`navigator.hardwareConcurrency > 4`, `Save-Data` off, and `prefers-reduced-motion` not set.
It also pauses (`frameloop="never"`) when the tab is hidden or the hero scrolls away.

Under `prefers-reduced-motion: reduce` the hero swaps the live composition for
`public/posters/hero-poster.webp`, scroll pinning is disabled, and every section renders its
final state.

---

## Generated images

`public/og-image.png` (1200×630) and `public/posters/hero-poster.webp` are rendered from
`assets/og-image.svg` by `npm run assets` (uses `sharp`). Both outputs are committed so a clean
checkout builds without running the generator. Edit the SVG, re-run the script, commit both.

---

## Deploying

`npm run build` emits a fully static `out/` directory — no Node server required.
`trailingSlash: true` is set, so every route is a real `index.html` and works on hosts that do
not rewrite extensionless URLs.

### Deploy (Cloudflare Pages)

The site is live on Cloudflare Pages, project **`ai-cockpit`**:

|                   |                                  |
| ----------------- | -------------------------------- |
| Production        | https://ai-cockpit-12h.pages.dev |
| Custom domain     | https://aicockpit.dqstore.in     |
| Production branch | `main`                           |

`aicockpit.dqstore.in` is a temporary subdomain used until the real domain is chosen, which is
why every build sets `NEXT_PUBLIC_NOINDEX=true`.

#### Automatic deploys

`.github/workflows/ci.yml` deploys on every run, after the `lint · types · build · tests` job
passes — the deploy job `needs:` it and reuses the exact artifact that was tested, so what ships
is byte-for-byte what CI verified.

| Trigger        | Deploy                                                 |
| -------------- | ------------------------------------------------------ |
| push to `main` | production, `--branch main`                            |
| pull request   | preview, `--branch <head>`, URL posted as a PR comment |

Pull requests from forks are skipped: they receive no repository secrets and must never be able
to deploy. A per-target concurrency group prevents two deploys overlapping, and it never
cancels one in flight.

#### Repository configuration

Variables (not secret — they are baked into the public bundle):

```bash
gh variable set NEXT_PUBLIC_SITE_URL           --body https://aicockpit.dqstore.in
gh variable set NEXT_PUBLIC_NOINDEX            --body true
gh variable set NEXT_PUBLIC_TURNSTILE_SITE_KEY --body <site key>
```

Secrets:

```bash
gh secret set CLOUDFLARE_API_TOKEN    # prompts, so the value never reaches a shell history
gh secret set CLOUDFLARE_ACCOUNT_ID
```

The inquiry endpoint's own secrets are Cloudflare Pages secrets, not GitHub secrets — see
[Demo inquiries](#demo-inquiries).

The API token is a **custom token** from Cloudflare → My Profile → API Tokens, scoped to the
minimum: **Account → Cloudflare Pages → Edit**, limited to this account. Adding the custom
domain also needs **Zone → DNS → Edit** scoped to `dqstore.in` alone.

#### Manual deploy

```bash
NEXT_PUBLIC_SITE_URL=https://aicockpit.dqstore.in NEXT_PUBLIC_NOINDEX=true npm run build
npx wrangler pages deploy out --project-name ai-cockpit --branch main
```

#### When the real domain goes live

Point it at the same project, set `NEXT_PUBLIC_SITE_URL` to the new origin, **remove
`NEXT_PUBLIC_NOINDEX`** (or set it to `false`) and redeploy. Leaving it on would keep the
production site out of search results.

### Other hosts

- **Vercel** — detected automatically; `output: 'export'` is respected. `_headers` is ignored,
  so port those rules to `vercel.json` if you move.
- **Netlify** — build `npm run build`, publish directory `out`. `_headers` is supported.
- **Anything else** — serve `out/` as static files.

### After deploying

Re-run Lighthouse against the real origin, where the hosting variables are no longer a
confound:

```bash
npm run lighthouse -- --url https://aicockpit.dqstore.in
```

---

## Deviations from spec

Each of these follows the spec's own acceptance bar (§2) over its literal wording, and each is
commented at the site of the change.

| Spec                                                      | Shipped                                                                                                  | Why                                                                                                                                                                                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §6 Button: primary is "accent fill, **white text**, glow" | Accent fill, **dark ink** (`--color-bg`, `#070D13`)                                                      | White on `#1EA6C6` measures **2.86:1** — below the 4.5:1 WCAG AA minimum required by §2.5, and Lighthouse flags it. Dark ink on the same fill measures **6.8:1**. The same change applies to the accent chat bubble in the consultants panel. **Accepted.** |
| §6 ActionCard: "Approved cards at **60% opacity**"        | No opacity; decided cards recede via a softer border and `inkSoft` title                                 | Dimming the whole card drops its label text to ~2.7:1 and its status pills to ~3.1:1. The de-emphasis reads the same at full contrast.                                                                                                                      |
| §5 folder list includes `tailwind.config.ts`              | No config file; tokens live in `@theme` in `globals.css`                                                 | Tailwind 4 is CSS-first and treats the config file as legacy. Keeping one would split the token definitions in two, against §2.7.                                                                                                                           |
| §3 "Foreground 3D driven by Framer Motion"                | Framer Motion drives the three scroll scenes; the hero and the cheap effects are CSS                     | Framer Motion's runtime is 35 KB gzip. Keeping it out of the hero and off the critical path is what brings initial JS to 153 KB against §2.4's 180 KB budget. It is still the animation library for every scroll-linked scene.                              |
| §7.11 FAQ: "`<details>`/button with `aria-expanded`"      | Native `<details>`/`<summary>`                                                                           | `<summary>` already exposes the expanded state; adding `aria-expanded` would duplicate it. Removing the state also lets the whole section stay a server component.                                                                                          |
| §7.2/§8 mobile hero: "static poster of the stage"         | The DOM phone composition renders at all widths; `hero-poster.webp` is used for `prefers-reduced-motion` | §8 explicitly permits the DOM composition "if it stays cheap". It is cheaper than downloading the poster, and stays crisp. The poster still ships and is still used.                                                                                        |
| §4.3 "Container: max-width 1200px, side padding 120px"    | 1200px is the **content** width; the gutter sits outside it (1440px frame)                               | With the padding inside 1200px, the content column is 960px — too narrow for §7.2's 700px copy column beside the phone, and the H1 wrapped to three lines.                                                                                                  |

---

## Accessibility

WCAG 2.1 AA contrast throughout, a skip link, semantic landmarks, visible accent focus rings,
≥ 44px tap targets, `aria-expanded` on the FAQ and mobile menu, a focus-trapped demo modal, and
full `prefers-reduced-motion` support. The Playwright suite runs a dedicated reduced-motion
project and asserts no horizontal overflow at 320 / 390 / 768 / 1024 / 1440.
