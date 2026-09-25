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
cp .env.example .env.local     # then fill in NEXT_PUBLIC_DEMO_URL
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

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DEMO_URL` | For production | The Cal.com / Calendly link behind **every** "Book a demo" and "Get early access" button. Falls back to `#book-demo` when unset, which keeps the page usable locally. |
| `NEXT_PUBLIC_SITE_URL` | For production | Absolute origin, used for the canonical URL and Open Graph tags. **No fallback:** when unset, the canonical, `og:url` and the social-card image are omitted rather than pointing at a guessed domain. |
| `NEXT_PUBLIC_NOINDEX` | Staging only | `"true"` emits `<meta name="robots" content="noindex, nofollow">` and a `robots.txt` containing `Disallow: /`. Anything else (including unset) leaves the site indexable. |

All three are inlined at build time, so **a change requires a rebuild**, not just a redeploy of
`out/`. Copy `.env.example` to `.env.local` to set them for local development.

---

## Editing content

**All user-facing copy lives in `src/content/site.ts`.** Components never hard-code strings.
To change a headline, a price or a FAQ answer, edit that file only — the FAQ JSON-LD in
`src/app/layout.tsx` is generated from the same data, so structured data cannot drift from
the page.

Likewise, no component hard-codes a colour or a size: everything comes from the `@theme`
tokens (`bg-surface`, `text-h2`, `rounded-(--radius-panel)`, `shadow-(--shadow-deep)`, …).

---

## Architecture

```
src/
  app/            layout (fonts, metadata, JSON-LD), page (section order), globals.css (tokens)
  content/site.ts every string and link on the site
  styles/tokens.ts token values mirrored for TS (three.js, asset generation)
  components/
    ui/           Button, Pill, Eyebrow, Card/GlassCard, Container, Section, Logo, icons/
    mock/         PhoneFrame, ActionCard, PushBanner, FeedScreen, DetailScreen
    motion/       MotionRoot (LazyMotion), features (lazy feature bundle), useInView
    three/        HeroScene + OrbitRing / AgentNode / SignalParticles, capability hooks
    sections/     Nav, Hero, Platforms, Problem, HowItWorks, ApproveMoment, UseCases,
                  Consultants, Security, Pricing, Faq, FinalCta, Footer, StickyCta
    DemoModal.tsx
tests/smoke.spec.ts
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

| | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| **Mobile** | 89 | 100 | 100 | 100 | 2764 ms | 0.000 | 326 ms |
| **Desktop** | 100 | 100 | 100 | 100 | 592 ms | 0.000 | 38 ms |
| Target (spec §2) | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 | < 2500 ms | < 0.05 | — |

Accessibility, best practices, SEO, CLS and desktop performance all clear the bar. Mobile
performance sits at the threshold (spread across runs: 76 / 89 / 89 / 91 / 91) and mobile LCP
reads ~2.76 s, both driven by the same thing: **the local harness, not the page.**

A control page served from the same local server — one `<h1>`, one inline `<style>`, no
JavaScript, no fonts, no images — measures **LCP 2788 ms** under the same mobile profile. The
full marketing site measures 2764 ms. In other words the page adds nothing measurable over an
empty document; the number is Lantern's simulation of connection setup against a plain
HTTP/1.1 origin with no CDN, no HTTP/2 and no cache headers. The *observed* (unthrottled) LCP
in the same trace is **172 ms**.

Re-measure against the real deployment before treating mobile LCP as a defect: a CDN host
(Cloudflare Pages, Vercel) gives HTTP/2 or /3, edge termination and immutable caching for
`/_next/static/*`, none of which `serve` provides.

### Bundle budget

The spec's budget is **≤ 180 KB gzip of initial JS**, excluding the lazy 3D chunk. The build
lands at **153 KB** because neither animation library is on the critical path:

| Layer | gzip | When it loads |
|---|---|---|
| React + React DOM + Next App Router runtime | 138.9 KB | initial |
| Site code (all 13 sections, server-rendered) | 14.1 KB | initial |
| **Initial total** | **153.0 KB** | |
| Framer Motion (core + `domAnimation` + scroll hooks) | 35.4 KB | on scroll, per scene |
| three.js + R3F + drei | 250.5 KB | desktop only, after `requestIdleCallback` |

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

Two tests keep this honest: one asserts that no script referenced by the initial HTML contains
Framer Motion or three.js, and another asserts the motion chunk *does* arrive once you scroll.

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

This is the current target. The staging host is **`aicockpit.dqstore.in`**, a temporary
subdomain used until the real domain is chosen.

1. **Connect the repo** — Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to
   Git, and pick `AI_cockpit_marketing_web_page`.
2. **Build settings** — framework preset **Next.js (Static HTML Export)**:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: repository root (this project is the whole repo)
3. **Environment variables** (Settings → Environment variables, Production *and* Preview):

   | Variable | Staging value |
   |---|---|
   | `NEXT_PUBLIC_DEMO_URL` | the Cal.com / Calendly link |
   | `NEXT_PUBLIC_SITE_URL` | `https://aicockpit.dqstore.in` |
   | `NEXT_PUBLIC_NOINDEX` | `true` |

4. **Custom domain** — Pages project → Custom domains → add `aicockpit.dqstore.in`, then at the
   DNS provider for `dqstore.in` add a **CNAME** record:

   ```
   aicockpit   CNAME   <project>.pages.dev
   ```

   Cloudflare issues the certificate once the record resolves.
5. **When the real domain goes live** — point it at the same project, set
   `NEXT_PUBLIC_SITE_URL` to the new origin, **remove `NEXT_PUBLIC_NOINDEX`** (or set it to
   `false`) and redeploy. Leaving it on would keep the production site out of search results.

`public/_headers` ships with the build and Cloudflare Pages applies it automatically:
immutable one-year caching for `/_next/static/*` (the filenames are content-hashed), a
revalidate-always policy for HTML, and the security headers — `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` and a CSP scoped to what the
site actually loads (everything is same-origin; `style-src` allows `'unsafe-inline'` because
Next inlines the stylesheet and React writes inline style attributes).

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

| Spec | Shipped | Why |
|---|---|---|
| §6 Button: primary is "accent fill, **white text**, glow" | Accent fill, **dark ink** (`--color-bg`, `#070D13`) | White on `#1EA6C6` measures **2.86:1** — below the 4.5:1 WCAG AA minimum required by §2.5, and Lighthouse flags it. Dark ink on the same fill measures **6.8:1**. The same change applies to the accent chat bubble in the consultants panel. **Open for review — decide from the screenshots.** |
| §6 ActionCard: "Approved cards at **60% opacity**" | No opacity; decided cards recede via a softer border and `inkSoft` title | Dimming the whole card drops its label text to ~2.7:1 and its status pills to ~3.1:1. The de-emphasis reads the same at full contrast. |
| §5 folder list includes `tailwind.config.ts` | No config file; tokens live in `@theme` in `globals.css` | Tailwind 4 is CSS-first and treats the config file as legacy. Keeping one would split the token definitions in two, against §2.7. |
| §3 "Foreground 3D driven by Framer Motion" | Framer Motion drives the three scroll scenes; the hero and the cheap effects are CSS | Framer Motion's runtime is 35 KB gzip. Keeping it out of the hero and off the critical path is what brings initial JS to 153 KB against §2.4's 180 KB budget. It is still the animation library for every scroll-linked scene. |
| §7.11 FAQ: "`<details>`/button with `aria-expanded`" | Native `<details>`/`<summary>` | `<summary>` already exposes the expanded state; adding `aria-expanded` would duplicate it. Removing the state also lets the whole section stay a server component. |
| §7.2/§8 mobile hero: "static poster of the stage" | The DOM phone composition renders at all widths; `hero-poster.webp` is used for `prefers-reduced-motion` | §8 explicitly permits the DOM composition "if it stays cheap". It is cheaper than downloading the poster, and stays crisp. The poster still ships and is still used. |
| §4.3 "Container: max-width 1200px, side padding 120px" | 1200px is the **content** width; the gutter sits outside it (1440px frame) | With the padding inside 1200px, the content column is 960px — too narrow for §7.2's 700px copy column beside the phone, and the H1 wrapped to three lines. |

---

## Accessibility

WCAG 2.1 AA contrast throughout, a skip link, semantic landmarks, visible accent focus rings,
≥ 44px tap targets, `aria-expanded` on the FAQ and mobile menu, a focus-trapped demo modal, and
full `prefers-reduced-motion` support. The Playwright suite runs a dedicated reduced-motion
project and asserts no horizontal overflow at 320 / 390 / 768 / 1024 / 1440.
