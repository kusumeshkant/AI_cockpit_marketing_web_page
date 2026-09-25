# AI Cockpit — Marketing Website Spec (code-ready)

*Authoritative spec for building the marketing site. Source design: Figma file "AI Cockpit" (see §12). This document is the source of truth — the Figma file is for visual reference only (the Figma account is on the Starter plan with a very small monthly MCP call quota, so do not rely on reading Figma from code tools). Last updated: 2026-09-25.*

---

## 1. Goal

A single, dark, 3D-feeling landing page that makes AI automation consultants/agencies **book a demo**. It must explain AI Cockpit in under 10 seconds: *your AI agents propose actions → you approve, edit or reject from your phone → the agent resumes.*

- **Brand name:** AI Cockpit (never "AI_Cockpit" in UI).
- **Language:** English only.
- **Primary audience:** AI automation consultants & agencies (n8n / Make / Zapier / custom builders). Secondary: SMB owners, developers.
- **Primary CTA (everywhere):** **Book a demo** → external booking link from env `NEXT_PUBLIC_DEMO_URL` (Cal.com/Calendly; placeholder `#book-demo` until set).
- **Secondary CTA:** "Watch 60-sec demo" (opens a modal with a video placeholder; video file comes later). "Get early access" on Solo/Pro pricing cards → same booking link for now.

## 2. Principles (acceptance bar)

1. **Message first, 3D second.** Headline, sub-copy and CTA must be visible and readable before any 3D/WebGL loads. 3D is lazy-loaded and never blocks text.
2. **Every 3D moment explains a step** of the story (agent → phone → approve → agent resumes). Decorative-only 3D is cut.
3. **Honesty.** No fake testimonials, customer logos, user counts or stats. Pricing is labelled "Early access". Don't claim features that don't exist (no multi-workspace, no team roles).
4. **Performance:** Lighthouse mobile ≥ 90 Performance, ≥ 95 Accessibility/SEO/Best Practices. LCP < 2.5s, CLS < 0.05. Initial JS (excluding lazy 3D chunk) ≤ 180 KB gzip. 3D chunk loads after `requestIdleCallback` / in-view.
5. **Accessible:** WCAG 2.1 AA contrast, full keyboard nav, visible focus rings (accent), semantic landmarks, `prefers-reduced-motion` fully respected (no parallax, no auto-animation, static posters).
6. **Responsive:** 320px → 1920px. Tap targets ≥ 44px.
7. **Centralised tokens:** no hard-coded colors/sizes in components — only design tokens (§4). Same values as the Flutter app's `AppColors` dark theme.

## 3. Tech stack

- **Next.js (App Router) + TypeScript**, static export (`output: 'export'`) so it can host anywhere (Cloudflare Pages / Vercel / Netlify).
- **Tailwind CSS** with tokens exposed as CSS variables (theme mapped to the variables).
- **3D:** `three` + `@react-three/fiber` + `@react-three/drei` — used for the **background depth layer only** (grid, glow, orbit rings, agent nodes, signal particles).
- **Foreground "3D" (phone, cards, push banner):** DOM elements with **CSS 3D transforms** driven by **Framer Motion** (`motion`) — keeps text crisp, accessible and cheap.
- **Fonts:** `next/font/google` — Archivo (700, 800), IBM Plex Sans (400, 500, 600), IBM Plex Mono (500, 600). `display: swap`, subset latin.
- **Icons:** inline SVG components (stroke 1.8, rounded caps). No emoji, no icon fonts.
- **Lint/quality:** ESLint + Prettier, TypeScript strict, Playwright smoke test, Lighthouse CI (optional script).
- Use the latest stable versions at build time; pin them in `package.json`.

## 4. Design tokens

### 4.1 Colors (dark only — the site is dark-first; no light theme needed)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#070D13` | Page background, hero, dark sections |
| `paper` | `#0C141C` | Alternate section background |
| `surface` | `#16212C` | Cards, panels |
| `surfaceAlt` | `#1B2836` | Push banner, raised surfaces |
| `line` | `#26343F` | Borders, dividers |
| `lineStrong` | `#374956` | Glass card borders, secondary button border |
| `ink` | `#E7EDF2` | Primary text |
| `inkSoft` | `#B3C1CC` | Body text |
| `muted` | `#8595A2` | Labels, meta |
| `accent` | `#1EA6C6` | Primary button, HUD lines, focus ring |
| `accentBright` | `#3FC2DF` | Eyebrows, highlights, headline 2nd line |
| `accentInk` | `#BFE8F2` | Text on `accentWash` |
| `accentWash` | `#122D38` | Accent background tint |
| `pending` / `pendingBg` | `#E6A848` / `#3A2C12` | Pending status |
| `go` / `goBg` | `#4BBD83` / `#12301F` | Approve / success / checkmarks |
| `stop` / `stopBg` | `#E0705F` / `#381914` | Reject / problem eyebrow |

Rules: amber = pending, green = approve, red = reject/problem. Teal = primary actions + HUD only, never a status.

### 4.2 Typography

| Style | Font | Weight | Desktop size / line-height / tracking | Mobile |
|---|---|---|---|---|
| Hero H1 | Archivo | 800 | 60 / 1.04 / -0.03em | 40 / 1.04 |
| Section H2 | Archivo | 800 | 52 / 1.08 / -0.02em | 34 / 1.08 |
| Sub H2 (panel) | Archivo | 800 | 44 / 1.08 | 30 |
| H3 | Archivo | 700 | 22–26 / 1.2 / -0.01em | 18–19 |
| Body L | IBM Plex Sans | 400 | 19–20 / 1.55 | 16–17 |
| Body | IBM Plex Sans | 400 | 15–16 / 1.55 | 14–15 |
| Button | IBM Plex Sans | 600 | 17 (sm 14) | 16 |
| Eyebrow / label | IBM Plex Mono | 600 | 12–13, UPPERCASE, +0.12–0.14em | 10–11 |

Use fluid type (`clamp()`) between mobile and desktop values.

### 4.3 Spacing, radius, effects

- Container: max-width 1200px, side padding 120px desktop / 20px mobile (use `clamp`).
- Section vertical padding: 128px desktop / 72px mobile. Section header → content gap 56px / 28px.
- Radius: button 12, card 20 (small cards 14–16), panel 28, pill 100.
- **Deep shadow:** `0 40px 80px -10px rgba(0,0,0,.55)`.
- **Accent glow:** `0 0 80px rgba(30,166,198,.25)`; primary button `0 8px 28px rgba(30,166,198,.45)`.
- **Glass card:** `background: rgba(22,33,44,.72)`, `backdrop-filter: blur(20px)`, border 1px `lineStrong`, deep shadow.
- **Hero grid:** 80px grid lines, `accent` at 5% opacity.
- **Radial glow:** circle gradient `accent` 30% → transparent.

## 5. Folder structure (inside `product/marketing_page/`)

```
product/marketing_page/
  package.json · next.config.ts · tsconfig.json · tailwind.config.ts · postcss.config.mjs
  .env.example              # NEXT_PUBLIC_DEMO_URL=
  README.md                 # run, build, deploy, env
  public/
    og-image.png            # 1200x630 (generate from hero)
    posters/hero-poster.webp  # static fallback for mobile / reduced motion
    favicon.svg             # HUD mark
  src/
    app/
      layout.tsx            # fonts, metadata, <body class="bg-bg text-ink">
      page.tsx              # composes sections in order
      globals.css           # CSS variables (tokens), base styles, focus ring
    content/
      site.ts               # ALL copy + links (single source of truth for text)
    styles/tokens.ts        # token values mirrored for TS (3D scene colors)
    components/
      ui/                   # Button, Pill, GlassCard, Card, Eyebrow, SectionHeader, Container, Logo, Icon/*
      mock/                 # PhoneFrame, ActionCard, PushBanner, DetailScreen, FeedScreen
      three/                # HeroScene.tsx (R3F), OrbitRing, AgentNode, SignalParticles, useReducedMotion
      sections/             # Nav, Hero, Platforms, Problem, HowItWorks, ApproveMoment,
                            # UseCases, Consultants, Security, Pricing, Faq, FinalCta, Footer, StickyCta
    components/DemoModal.tsx
  tests/smoke.spec.ts       # Playwright: page loads, CTAs link to demo URL, no console errors
```

All user-facing copy lives in `src/content/site.ts` (no strings hard-coded inside components).

## 6. Shared components

- **Button** — variants `primary` (accent fill, white text, glow), `secondary` (surface 60% + lineStrong border), `ghost` (accentBright text + →), `approve` (go fill), `reject` (stop outline). Heights 48 (sm 40). Focus ring 2px accent + 2px offset.
- **Pill** — status pill: 6px dot + mono uppercase label; tones pending/approved/rejected/live/beta.
- **Eyebrow** — mono uppercase label; default accentBright; hero version is a pill with glowing dot on `accentWash`.
- **GlassCard**, **Card** — per §4.3.
- **Logo** — HUD mark (two concentric rings + dot, accentBright) + "AI Cockpit" in Archivo 700.
- **PhoneFrame** — rounded device (radius 46, bezel `#04080C`, border lineStrong 2px, deep shadow + accent glow), inner screen `paper` radius 38, status bar "9:41".
- **ActionCard** — mono source label (e.g. `N8N · JOB AGENT`) + Pill, title (Plex Sans 600), preview line (muted). Approved cards at 60% opacity.
- **PushBanner** — glass (surfaceAlt 92%), app icon tile with HUD mark, "AI COCKPIT · now", title, subtitle, accentBright glow.

## 7. Page sections (order, layout, exact copy)

### 7.1 Nav (sticky, blurred `bg` 90% after scroll)
Logo · links: How it works, Use cases, For consultants, Security, Pricing (anchor links) · **Book a demo** (primary sm).
Mobile: logo + menu button → full-screen sheet with the 5 links + Book a demo.

### 7.2 Hero (desktop height ~940px; `id="top"`)
Background: 80px HUD grid + big teal radial glow behind the phone + 3D canvas (§8).
Left column (max 700px):
- Eyebrow pill: `HUMAN-IN-THE-LOOP FOR AI AGENTS`
- H1: **Your AI agents work.** / **You stay the pilot.** (2nd line `accentBright`)
- Sub: "AI Cockpit is the mobile control panel for your n8n, Make, Zapier and custom agents. Every sensitive action waits for your yes — review, edit or reject it in one tap, from anywhere."
- CTAs: **Book a demo** · "Watch 60-sec demo" (play icon)
- Trust row: `WORKS WITH` + chips: n8n, Make, Zapier, Custom code
Right stage: tilted phone (rotateZ -7°, slight rotateY) showing **Pending** feed (3 WAITING):
1. `N8N · JOB AGENT` PENDING — "Apply: Senior Flutter @ Acme" — "Tailored application ready to send"
2. `MAKE · INVOICE AGENT` PENDING — "Pay invoice #1042 — $2,400" — "Vendor: Northwind Supplies"
3. `CUSTOM · SALES AGENT` PENDING — "Follow-up to 12 warm leads" — "Personalised emails drafted"
4. `ZAPIER · SOCIAL AGENT` APPROVED (60%) — "LinkedIn post: launch week" — "Posted 2h ago"
Bottom nav in phone: ACTIONS (active) · CONNECT · AUDIT · SETTINGS.
Floating: push banner "n8n Job agent needs approval / Apply: Senior Flutter @ Acme" over the phone top; a flying glass action card "MAKE · INVOICE AGENT — Pay invoice #1042 — $2,400 — Needs your approval" top-left of the phone; dashed signal path; agent nodes (n8n, Make, Zapier, `</>`) on a tilted orbit ring.
Mobile: stacked — text, full-width CTAs, then static poster of the stage (§9).

### 7.3 Platforms strip (`paper`, borders top/bottom)
Label: `ONE SMALL CONTRACT · ANY AGENT PLATFORM`. Words (Archivo 700, 30px, inkSoft 70%): n8n · Make · Zapier · Python · Node.js · Any webhook. Slow marquee, pause on hover; static when reduced motion.

### 7.4 Problem
Two columns. Left: eyebrow `THE PROBLEM` (stop color); H2 "Your agents are fast. Your approvals are scattered."; body "Approval requests hide in Slack threads, email chains and Telegram chats. Nothing is in one place, nothing is on record, and editing a draft means going back to the laptop. So you either slow your agents down — or let them act unchecked."
Right: chaos stage — 5 tilted glass cards with a faint red glow:
- `#SLACK · OPS` "@you can someone approve the invoice run??"
- `GMAIL · 14 UNREAD` "Re: Re: Fwd: Approve AI draft before 5pm"
- `TELEGRAM · BOT` "Reply YES to send 12 emails"
- `SLACK · #SALES` "Did the agent already email that lead?"
- `EMAIL · BOSS` "Who approved this post?!"
(Mobile: first 3 cards only.)

### 7.5 How it works (`paper`, `id="how-it-works"`)
Eyebrow `HOW IT WORKS`; H2 "From agent to approval in three steps."; sub "One contract works for every platform. No per-tool plugins, no code inside your agent beyond one signed request."
Three cards (big `01/02/03` numbers in accent, HUD mark, title, body, tag):
1. **Connect your agent** — "In the app, tap Connect. You get an inbound URL and a signing secret (shown once). Paste them into n8n, Make, Zapier or your code." — `CONNECT · ~5 MIN`
2. **Agent asks, your phone buzzes** — "When your agent needs a yes, it sends a signed action and pauses. You get a push with exactly what it wants to do." — `PUSH · INSTANT`
3. **You decide, agent resumes** — "Approve, edit or reject in one tap. AI Cockpit records the decision and calls your agent back — it carries on." — `CALLBACK · AUDITED`

### 7.6 Approve moment
Two columns. Left: phone (rotate 5°) with green glow + ring, showing the **Action Detail** screen:
- Back row `‹ N8N · JOB AGENT` + PENDING; title "Apply: Senior Flutter @ Acme"
- `WHAT IT WANTS TO DO` panel (accentWash): "Send a tailored application email to hr@acme.example"
- Email card: `TO hr@acme.example`; subject field outlined in accent labelled `SUBJECT · EDITABLE` — "Application: Senior Flutter Developer"; body "Dear Acme team, I have 5+ years building production Flutter apps — clean architecture, Riverpod, CI/CD — and would love to help ship your mobile roadmap…"
- Decision bar: Reject (outline red) · Edit (secondary) · **Approve** (green, widest, glowing). A tap ring near Approve.
Right: eyebrow `THE APPROVE MOMENT`; H2 "Review it. Fix it. Ship it. In five seconds."; 4 feature rows (icon tile + title + body):
- **Edit before it ships** — "Change the subject line, the amount, the wording — right on your phone. The agent receives your edited version."
- **Every decision on record** — "An append-only audit log shows who approved what, when, and what was changed. Nothing gets lost."
- **Run agents from your pocket** `BETA` — "Start any connected agent on demand with one tap — before a meeting, when a lead lands."
- **Push when it matters** — "Instant notifications, with a live feed as backup so no approval ever slips through."

### 7.7 Use cases (`paper`, `id="use-cases"`)
Eyebrow `USE CASES`; H2 "If a mistake would cost you, put a pilot on it." Four cards, each with a mini ActionCard ("Waiting on you") + title + body:
- Sales follow-ups — `CUSTOM · SALES AGENT` pending "Follow-up to 12 warm leads" — "Approve personalised emails before they reach a client."
- Invoices & payments — `MAKE · FINANCE AGENT` pending "Pay invoice #1042 — $2,400" — "Money never moves without a human yes."
- Social & content — `ZAPIER · SOCIAL AGENT` approved "LinkedIn post: launch week" — "Keep every post on-brand before it goes live."
- Recruiting & jobs — `N8N · JOB AGENT` rejected "Apply: Growth Marketer @ Beta" — "Only the right applications get sent."

### 7.8 For consultants (`id="consultants"`)
Big panel (radius 28, linear gradient accentWash → surface, accent border 50%, glow). Left: eyebrow `FOR AI AUTOMATION CONSULTANTS & AGENCIES`; H2 "Close more automation deals. Give clients the brake pedal."; checklist (green ✓):
- Answer "what if the AI gets it wrong?" before the client asks
- Works with whatever you build on — n8n, Make, Zapier or code
- An audit trail your clients can actually read
- Consultant plan built for reselling to your clients
CTAs: **Book a demo** · ghost "See Consultant plan →" (scrolls to pricing).
Right: chat bubbles — `YOUR CLIENT` "What if the AI emails the wrong person?" · `YOU` (accent, right-aligned) "It can't. Nothing leaves until you tap Approve on your phone." · `YOUR CLIENT` "…okay. Where do I sign?"

### 7.9 Security (`paper`, `id="security"`)
Eyebrow `TRUST & SECURITY`; H2 "Built like flight software."; sub "Oversight only works if the control panel itself is trustworthy." 6 cards (3×2; mobile = list rows), green check tile + title + body:
- Signed requests — "Every action is signed (HMAC-SHA256) and verified before it is accepted."
- Nothing gets lost — "Actions are stored before any notification goes out."
- No double decisions — "Each approval is recorded exactly once, even on a flaky network."
- Secrets shown once — "Signing secrets live in a vault; after setup you only ever see a hint."
- Append-only audit log — "History can be read, never rewritten."
- Workspace isolation — "You can only ever see your own workspace's data."

### 7.10 Pricing (`id="pricing"`)
Eyebrow `EARLY ACCESS PRICING`; H2 "Simple plans. Cancel anytime."; sub "Final plan limits are announced at launch. Early-access partners lock in these prices." (centered)
- **Solo** $29/month — "For one person running their own agents." — Connect your agents · Push approvals + live feed · Approve, edit or reject · Audit log — CTA secondary "Get early access"
- **Pro** $59/month — "For power users with many workflows." — Everything in Solo · More agents & actions · Run agents from the app · Priority support — "Get early access"
- **Consultant** $99+/month — highlighted (accentWash, accent border, glow, `MOST POPULAR` pill) — "For agencies reselling oversight to clients." — Everything in Pro · Built for reselling · Onboarding with the founder · Early roadmap input — CTA **Book a demo**
Mobile order: Consultant, Pro, Solo.

### 7.11 FAQ (`paper`)
Left: eyebrow `FAQ`, H2 "Questions pilots ask." Right: accordion (first open; `<details>`/button with `aria-expanded`):
1. Why not just approve in Slack or Telegram? — "You can — until you run five agents for three clients. AI Cockpit gives you one inbox for every agent, edit-before-approve, and an audit log. Chat apps give you scattered threads."
2. Do I have to change my agent? — "Only one step: your agent sends a signed request and waits for our callback. Everything else stays exactly as you built it."
3. Which platforms work? — "n8n, Make, Zapier and any custom code that can send a webhook."
4. Is my data safe? — "Requests are signed and verified, secrets are shown once, and every workspace is isolated. We never log your action payloads."
5. When can I start? — "We are onboarding early-access partners now. Book a demo and we will set it up with you."
Also emit FAQPage JSON-LD.

### 7.12 Final CTA
Centered over concentric HUD rings (one dashed) + big glow: H2 "Put a pilot in every AI workflow."; sub "See AI Cockpit approve a real agent action live — in 20 minutes."; **Book a demo**.

### 7.13 Footer
Logo + "The steering wheel and brake pedal for AI agents." · links: How it works, Security, Pricing, Privacy, Terms (Privacy/Terms → `#` placeholders) · "© 2026 AI Cockpit".

### 7.14 Sticky CTA (mobile only)
Bottom bar (paper 95% + blur, top border) with full-width **Book a demo**; slides up once the hero leaves the viewport; respects safe-area inset.

## 8. 3D & motion spec

Depth planes everywhere: **back** (grid + glow + R3F canvas) parallax 0.2 · **middle** (glass cards) 0.5 · **front** (phone, CTA) 1.0.

**Hero scene (`three/HeroScene.tsx`, R3F, desktop/tablet only, lazy):**
- Transparent canvas behind the DOM stage, `dpr={[1, 1.75]}`, `frameloop="demand"` when tab hidden/out of view.
- Tilted orbit ring (torus/line, accent 35%) + inner dashed ring; 4 agent nodes (glass spheres/discs with labels via DOM overlay) orbit on a 20s loop; nodes behind the phone are dimmer & smaller.
- Every ~4s a glowing signal particle travels along a curve from an agent node to the phone; on arrival the **PushBanner** (DOM) drops in with a soft spring and the matching card in the feed pulses amber.
- Mouse parallax (max ±6° yaw/pitch on the stage).
- Idle phone float: y ±6px, yaw ±4°, 6s ease-in-out loop.

**Scroll scenes (Framer Motion `useScroll`):**
- Problem: section pinned ~1 viewport; chaos cards drift/wobble, then fly together into one stack as progress → 1.
- How it works: each card enters with `rotateX 14° → 0`, `y 40 → 0`, stagger 0.12s; a teal connector line draws 01 → 02 → 03 with scroll.
- Approve moment: pinned ~1 viewport; phone yaw 5° → 0°, subject field glow, tap ring on Approve → green pulse ring expands → a small card flies back out toward the top-left ("agent resumes").
- Use cases: cards tilt toward cursor (max 6°) with a moving glare.
- Consultants: panel glow breathes (4s); chat bubbles appear one by one.
- Security: check icons draw stroke-on when in view.
- Pricing: static; Consultant card border slow shimmer.
- Final CTA: rings rotate slowly in opposite directions.

**Reduced motion / mobile:**
- `prefers-reduced-motion: reduce` → no canvas, no pinning, no parallax, no auto-loops; show final states + `hero-poster.webp`.
- `< 768px` → no WebGL; hero uses the static poster (DOM phone composition is fine if it stays cheap) and simple fade-ins only.
- Detect low-end (`navigator.hardwareConcurrency <= 4` or save-data) → skip canvas.

## 9. Responsive rules

- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- < `lg`: all two-column sections stack (text first, visual second). Steps, use cases, security, pricing become single-column lists.
- Hero H1 wraps naturally on mobile; use `text-wrap: balance`.
- Nothing may overflow horizontally at 320px.

## 10. SEO & meta

- `<title>`: "AI Cockpit — Approve your AI agents' actions from your phone"
- Description: "The mobile control panel for n8n, Make, Zapier and custom AI agents. Review, edit or reject every sensitive action in one tap. Book a demo."
- Open Graph + Twitter card with `og-image.png` (1200×630, hero composition).
- Favicon: HUD mark SVG. Theme color `#070D13`.
- JSON-LD: `SoftwareApplication` (name, applicationCategory BusinessApplication, operatingSystem iOS/Android) + `FAQPage`.
- Canonical URL from env `NEXT_PUBLIC_SITE_URL`.

## 11. Acceptance criteria (Definition of Done)

- All 13 sections + sticky mobile CTA implemented with the exact copy from §7 (copy lives in `content/site.ts`).
- Every "Book a demo" button links to `NEXT_PUBLIC_DEMO_URL`.
- Visual match to the Figma composition and tokens (§4); no hard-coded hex/sizes in components.
- Hero text + CTA visible before the 3D chunk loads; 3D chunk is a separate lazy bundle.
- Reduced-motion and mobile fallbacks work (verified manually + Playwright emulation).
- Lighthouse mobile targets from §2 met on the production build.
- No horizontal overflow at 320 / 390 / 768 / 1024 / 1440.
- `npm run lint`, `npm run build` (static export) and `npm run test` (Playwright smoke) pass.
- `README.md` documents install, dev, build, env vars, deploy.

## 12. Figma reference (visual only — use sparingly)

- File: https://www.figma.com/design/eHftA7iq5QIBI6hx8n0oCc/AI-Cockpit
- Pages: `01 · Design System` (root frame `7:32`), `02 · Website — Desktop` (root `10:2`, hero `10:3`), `03 · Website — Mobile` (root `12:2`).
- Desktop section frame IDs: Hero `10:3`, Platforms `10:152`, Problem `10:161`, How it works `10:183`, Approve moment `10:222`, Use cases `10:290`, Consultants `10:339`, Security `10:371`, Pricing `10:407`, FAQ `10:479`, Final CTA `10:505`, Footer `10:515`.
- Yellow "3D / MOTION" notes next to each desktop section mirror §8.
- ⚠️ The Figma account is on the Starter plan (very small monthly MCP quota). Build from this spec. At most take **one** screenshot of the hero (`10:3`) if a visual check is needed.

---

## Appendix — implementation deviations

The shipped site differs from this spec in the places listed under **Deviations from spec** in
`../README.md`. Each one is there because following the spec literally would have broken another
rule in it (usually §2.4 performance or §2.5 accessibility). This document is left unedited so the
original intent stays visible.
