/**
 * Every user-facing string and link on the marketing site.
 * Components must not hard-code copy — import it from here.
 */

/** Turnstile site key. Public by design; the secret half lives on the server. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

/**
 * Absolute site origin, used for the canonical URL and Open Graph tags.
 *
 * There is deliberately no fallback: guessing a domain would publish a wrong
 * canonical URL. When this is unset the canonical, `og:url` and the absolute
 * image URLs are omitted entirely rather than pointing somewhere untrue.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || undefined;

/**
 * Set to `"true"` on staging so search engines stay away: it emits a
 * `noindex, nofollow` robots meta tag and a `Disallow: /` robots.txt.
 */
export const NOINDEX = process.env.NEXT_PUBLIC_NOINDEX === 'true';

export const brand = {
  name: 'AI Cockpit',
  tagline: 'The steering wheel and brake pedal for AI agents.',
  copyright: '© 2026 AI Cockpit',
} as const;

export const meta = {
  title: "AI Cockpit — Approve your AI agents' actions from your phone",
  description:
    'The mobile control panel for n8n, Make, Zapier and custom AI agents. Review, edit or reject every sensitive action in one tap. Request a demo.',
  ogImage: '/og-image.png',
} as const;

export const cta = {
  primary: 'Request a demo',
  secondary: 'Watch 60-sec demo',
  earlyAccess: 'Get early access',
  consultantPlan: 'See Consultant plan',
} as const;

export const nav = {
  links: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Use cases', href: '#use-cases' },
    { label: 'For consultants', href: '#consultants' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
  ],
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  skipToContent: 'Skip to content',
} as const;

export const demoModal = {
  title: '60-second demo',
  subtitle: 'A real agent action, approved from a phone.',
  placeholder:
    'The demo video is coming soon. Request a demo and we will walk you through it live.',
  close: 'Close',
} as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export type ActionStatus = 'pending' | 'approved' | 'rejected';

export interface ActionItem {
  /** Stable key for list rendering. */
  id: string;
  /** Mono source label, e.g. `N8N · JOB AGENT`. */
  source: string;
  status: ActionStatus;
  title: string;
  preview: string;
}

export const hero = {
  eyebrow: 'HUMAN-IN-THE-LOOP FOR AI AGENTS',
  headlineLine1: 'Your AI agents work.',
  headlineLine2: 'You stay the pilot.',
  sub: 'AI Cockpit is the mobile control panel for your n8n, Make, Zapier and custom agents. Every sensitive action waits for your yes — review, edit or reject it in one tap, from anywhere.',
  trustLabel: 'WORKS WITH',
  trustChips: ['n8n', 'Make', 'Zapier', 'Custom code'],
  feedTitle: 'Pending',
  feedCountLabel: '3 WAITING',
  actions: [
    {
      id: 'hero-job',
      source: 'N8N · JOB AGENT',
      status: 'pending',
      title: 'Apply: Senior Flutter @ Acme',
      preview: 'Tailored application ready to send',
    },
    {
      id: 'hero-invoice',
      source: 'MAKE · INVOICE AGENT',
      status: 'pending',
      title: 'Pay invoice #1042 — $2,400',
      preview: 'Vendor: Northwind Supplies',
    },
    {
      id: 'hero-sales',
      source: 'CUSTOM · SALES AGENT',
      status: 'pending',
      title: 'Follow-up to 12 warm leads',
      preview: 'Personalised emails drafted',
    },
    {
      id: 'hero-social',
      source: 'ZAPIER · SOCIAL AGENT',
      status: 'approved',
      title: 'LinkedIn post: launch week',
      preview: 'Posted 2h ago',
    },
  ] as ActionItem[],
  bottomNav: ['ACTIONS', 'CONNECT', 'AUDIT', 'SETTINGS'],
  push: {
    app: 'AI COCKPIT · now',
    title: 'n8n Job agent needs approval',
    subtitle: 'Apply: Senior Flutter @ Acme',
  },
  flyingCard: {
    source: 'MAKE · INVOICE AGENT',
    title: 'Pay invoice #1042 — $2,400',
    preview: 'Needs your approval',
  },
  /** Agent nodes orbiting the phone in the 3D layer. */
  agentNodes: ['n8n', 'Make', 'Zapier', '</>'],
  posterAlt:
    'AI Cockpit on a phone, showing three AI agent actions waiting for approval and a push notification from an n8n job agent.',
} as const;

/* ------------------------------------------------------------------ */
/* Platforms strip                                                     */
/* ------------------------------------------------------------------ */

export const platforms = {
  label: 'ONE SMALL CONTRACT · ANY AGENT PLATFORM',
  words: ['n8n', 'Make', 'Zapier', 'Python', 'Node.js', 'Any webhook'],
} as const;

/* ------------------------------------------------------------------ */
/* Problem                                                             */
/* ------------------------------------------------------------------ */

export const problem = {
  eyebrow: 'THE PROBLEM',
  heading: 'Your agents are fast. Your approvals are scattered.',
  body: 'Approval requests hide in Slack threads, email chains and Telegram chats. Nothing is in one place, nothing is on record, and editing a draft means going back to the laptop. So you either slow your agents down — or let them act unchecked.',
  cards: [
    { id: 'slack-ops', source: '#SLACK · OPS', text: '@you can someone approve the invoice run??' },
    { id: 'gmail', source: 'GMAIL · 14 UNREAD', text: 'Re: Re: Fwd: Approve AI draft before 5pm' },
    { id: 'telegram', source: 'TELEGRAM · BOT', text: 'Reply YES to send 12 emails' },
    { id: 'slack-sales', source: 'SLACK · #SALES', text: 'Did the agent already email that lead?' },
    { id: 'email-boss', source: 'EMAIL · BOSS', text: 'Who approved this post?!' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export const howItWorks = {
  eyebrow: 'HOW IT WORKS',
  heading: 'From agent to approval in three steps.',
  sub: 'One contract works for every platform. No per-tool plugins, no code inside your agent beyond one signed request.',
  steps: [
    {
      id: 'connect',
      number: '01',
      title: 'Connect your agent',
      body: 'In the app, tap Connect. You get an inbound URL and a signing secret (shown once). Paste them into n8n, Make, Zapier or your code.',
      tag: 'CONNECT · ~5 MIN',
    },
    {
      id: 'push',
      number: '02',
      title: 'Agent asks, your phone buzzes',
      body: 'When your agent needs a yes, it sends a signed action and pauses. You get a push with exactly what it wants to do.',
      tag: 'PUSH · INSTANT',
    },
    {
      id: 'callback',
      number: '03',
      title: 'You decide, agent resumes',
      body: 'Approve, edit or reject in one tap. AI Cockpit records the decision and calls your agent back — it carries on.',
      tag: 'CALLBACK · AUDITED',
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Approve moment                                                      */
/* ------------------------------------------------------------------ */

export const approveMoment = {
  eyebrow: 'THE APPROVE MOMENT',
  heading: 'Review it. Fix it. Ship it. In five seconds.',
  phoneAlt:
    'The AI Cockpit action detail screen: an n8n job agent asking to send an application email, with an editable subject line and Reject, Edit and Approve buttons.',
  detail: {
    back: 'N8N · JOB AGENT',
    status: 'pending' as ActionStatus,
    title: 'Apply: Senior Flutter @ Acme',
    intentLabel: 'WHAT IT WANTS TO DO',
    intent: 'Send a tailored application email to hr@acme.example',
    toLabel: 'TO',
    to: 'hr@acme.example',
    subjectLabel: 'SUBJECT · EDITABLE',
    subject: 'Application: Senior Flutter Developer',
    body: 'Dear Acme team, I have 5+ years building production Flutter apps — clean architecture, Riverpod, CI/CD — and would love to help ship your mobile roadmap…',
    reject: 'Reject',
    edit: 'Edit',
    approve: 'Approve',
  },
  features: [
    {
      id: 'edit',
      icon: 'edit' as const,
      title: 'Edit before it ships',
      body: 'Change the subject line, the amount, the wording — right on your phone. The agent receives your edited version.',
    },
    {
      id: 'audit',
      icon: 'history' as const,
      title: 'Every decision on record',
      body: 'An append-only audit log shows who approved what, when, and what was changed. Nothing gets lost.',
    },
    {
      id: 'run',
      icon: 'bolt' as const,
      title: 'Run agents from your pocket',
      badge: 'BETA',
      body: 'Start any connected agent on demand with one tap — before a meeting, when a lead lands.',
    },
    {
      id: 'push',
      icon: 'bell' as const,
      title: 'Push when it matters',
      body: 'Instant notifications, with a live feed as backup so no approval ever slips through.',
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Use cases                                                           */
/* ------------------------------------------------------------------ */

export interface UseCase {
  id: string;
  title: string;
  body: string;
  action: ActionItem;
}

export const useCases = {
  eyebrow: 'USE CASES',
  heading: 'If a mistake would cost you, put a pilot on it.',
  waitingLabel: 'Waiting on you',
  items: [
    {
      id: 'sales',
      title: 'Sales follow-ups',
      body: 'Approve personalised emails before they reach a client.',
      action: {
        id: 'uc-sales',
        source: 'CUSTOM · SALES AGENT',
        status: 'pending',
        title: 'Follow-up to 12 warm leads',
        preview: 'Personalised emails drafted',
      },
    },
    {
      id: 'invoices',
      title: 'Invoices & payments',
      body: 'Money never moves without a human yes.',
      action: {
        id: 'uc-invoice',
        source: 'MAKE · FINANCE AGENT',
        status: 'pending',
        title: 'Pay invoice #1042 — $2,400',
        preview: 'Vendor: Northwind Supplies',
      },
    },
    {
      id: 'social',
      title: 'Social & content',
      body: 'Keep every post on-brand before it goes live.',
      action: {
        id: 'uc-social',
        source: 'ZAPIER · SOCIAL AGENT',
        status: 'approved',
        title: 'LinkedIn post: launch week',
        preview: 'Posted 2h ago',
      },
    },
    {
      id: 'recruiting',
      title: 'Recruiting & jobs',
      body: 'Only the right applications get sent.',
      action: {
        id: 'uc-jobs',
        source: 'N8N · JOB AGENT',
        status: 'rejected',
        title: 'Apply: Growth Marketer @ Beta',
        preview: 'Not a fit — rejected',
      },
    },
  ] as UseCase[],
} as const;

/* ------------------------------------------------------------------ */
/* For consultants                                                     */
/* ------------------------------------------------------------------ */

export interface ChatBubble {
  id: string;
  from: string;
  side: 'left' | 'right';
  text: string;
}

export const consultants = {
  eyebrow: 'FOR AI AUTOMATION CONSULTANTS & AGENCIES',
  heading: 'Close more automation deals. Give clients the brake pedal.',
  checklist: [
    'Answer "what if the AI gets it wrong?" before the client asks',
    'Works with whatever you build on — n8n, Make, Zapier or code',
    'An audit trail your clients can actually read',
    'Consultant plan built for reselling to your clients',
  ],
  chat: [
    {
      id: 'c1',
      from: 'YOUR CLIENT',
      side: 'left',
      text: 'What if the AI emails the wrong person?',
    },
    {
      id: 'c2',
      from: 'YOU',
      side: 'right',
      text: "It can't. Nothing leaves until you tap Approve on your phone.",
    },
    { id: 'c3', from: 'YOUR CLIENT', side: 'left', text: '…okay. Where do I sign?' },
  ] as ChatBubble[],
} as const;

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

export const security = {
  eyebrow: 'TRUST & SECURITY',
  heading: 'Built like flight software.',
  sub: 'Oversight only works if the control panel itself is trustworthy.',
  items: [
    {
      id: 'signed',
      title: 'Signed requests',
      body: 'Every action is signed (HMAC-SHA256) and verified before it is accepted.',
    },
    {
      id: 'persisted',
      title: 'Nothing gets lost',
      body: 'Actions are stored before any notification goes out.',
    },
    {
      id: 'idempotent',
      title: 'No double decisions',
      body: 'Each approval is recorded exactly once, even on a flaky network.',
    },
    {
      id: 'secrets',
      title: 'Secrets shown once',
      body: 'Signing secrets live in a vault; after setup you only ever see a hint.',
    },
    {
      id: 'audit',
      title: 'Append-only audit log',
      body: 'History can be read, never rewritten.',
    },
    {
      id: 'isolation',
      title: 'Workspace isolation',
      body: "You can only ever see your own workspace's data.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  blurb: string;
  features: string[];
  ctaLabel: string;
  variant: 'primary' | 'secondary';
  highlighted: boolean;
}

export const pricing = {
  eyebrow: 'EARLY ACCESS PRICING',
  heading: 'Simple plans. Cancel anytime.',
  sub: 'Final plan limits are announced at launch. Early-access partners lock in these prices.',
  popularLabel: 'MOST POPULAR',
  perMonth: '/month',
  plans: [
    {
      id: 'solo',
      name: 'Solo',
      price: '$29',
      blurb: 'For one person running their own agents.',
      features: [
        'Connect your agents',
        'Push approvals + live feed',
        'Approve, edit or reject',
        'Audit log',
      ],
      ctaLabel: cta.earlyAccess,
      variant: 'secondary',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$59',
      blurb: 'For power users with many workflows.',
      features: [
        'Everything in Solo',
        'More agents & actions',
        'Run agents from the app',
        'Priority support',
      ],
      ctaLabel: cta.earlyAccess,
      variant: 'secondary',
      highlighted: false,
    },
    {
      id: 'consultant',
      name: 'Consultant',
      price: '$99+',
      blurb: 'For agencies reselling oversight to clients.',
      features: [
        'Everything in Pro',
        'Built for reselling',
        'Onboarding with the founder',
        'Early roadmap input',
      ],
      ctaLabel: cta.primary,
      variant: 'primary',
      highlighted: true,
    },
  ] as PricingPlan[],
} as const;

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faq = {
  eyebrow: 'FAQ',
  heading: 'Questions pilots ask.',
  items: [
    {
      id: 'why-not-slack',
      q: 'Why not just approve in Slack or Telegram?',
      a: 'You can — until you run five agents for three clients. AI Cockpit gives you one inbox for every agent, edit-before-approve, and an audit log. Chat apps give you scattered threads.',
    },
    {
      id: 'change-agent',
      q: 'Do I have to change my agent?',
      a: 'Only one step: your agent sends a signed request and waits for our callback. Everything else stays exactly as you built it.',
    },
    {
      id: 'platforms',
      q: 'Which platforms work?',
      a: 'n8n, Make, Zapier and any custom code that can send a webhook.',
    },
    {
      id: 'data-safe',
      q: 'Is my data safe?',
      a: 'Requests are signed and verified, secrets are shown once, and every workspace is isolated. We never log your action payloads.',
    },
    {
      id: 'start',
      q: 'When can I start?',
      a: 'We are onboarding early-access partners now. Request a demo and we will set it up with you.',
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Final CTA + footer                                                  */
/* ------------------------------------------------------------------ */

export const finalCta = {
  heading: 'Put a pilot in every AI workflow.',
  sub: 'See AI Cockpit approve a real agent action live — in 20 minutes.',
} as const;

export const footer = {
  links: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '#' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Demo inquiry form                                                   */
/* ------------------------------------------------------------------ */

export const inquiry = {
  /** Section + modal heading. */
  title: 'Request a demo',
  sub: 'Tell us a little about your setup and we will reach out within 24 hours.',
  sectionEyebrow: 'REQUEST A DEMO',
  optional: '(optional)',
  required: 'required',
  close: 'Close',
  submit: 'Request a demo',
  submitting: 'Sending…',
  retry: 'Try again',

  fields: {
    name: { label: 'Full name', placeholder: 'Kusumeshkant Sharma' },
    phone: {
      label: 'Phone / WhatsApp',
      placeholder: '+91 98765 43210',
      hint: 'Include your country code.',
    },
    email: { label: 'Email', placeholder: 'you@company.com' },
    company: { label: 'Company / agency', placeholder: 'Northwind Automation' },
    role: {
      label: 'You are…',
      placeholder: 'Choose one',
      options: [
        { value: 'consultant', label: 'Automation consultant / agency' },
        { value: 'business', label: 'Business owner' },
        { value: 'developer', label: 'Developer' },
        { value: 'other', label: 'Other' },
      ],
    },
    tools: {
      label: 'Tools you use',
      options: [
        { value: 'n8n', label: 'n8n' },
        { value: 'make', label: 'Make' },
        { value: 'zapier', label: 'Zapier' },
        { value: 'custom', label: 'Custom code' },
        { value: 'none', label: 'Not using agents yet' },
      ],
    },
    bestTime: {
      label: 'Best time to call',
      placeholder: 'Choose one',
      options: [
        { value: 'morning', label: 'Morning (IST)' },
        { value: 'afternoon', label: 'Afternoon (IST)' },
        { value: 'evening', label: 'Evening (IST)' },
      ],
    },
    message: {
      label: 'What do you want your agents to do?',
      placeholder: 'Send client follow-ups, pay vendor invoices, post to LinkedIn…',
      counter: 'characters left',
    },
    consent: {
      label: 'I agree to be contacted about AI Cockpit.',
      privacyLabel: 'Privacy',
    },
    /** Honeypot. Hidden from humans; only bots fill it in. */
    website: { label: 'Website' },
  },

  success: {
    /** `{name}` is replaced with the visitor's first name. */
    title: 'Thanks, {name} — we will reach out within 24 hours.',
    body: 'Keep an eye on your phone and inbox. If anything changes, just reply to our message.',
  },

  /** Turnstile is a script, so a submission without JavaScript cannot work. */
  noscript:
    'This form needs JavaScript, because the anti-spam check does. If you would rather not enable it, reply to any post of ours on LinkedIn and we will pick it up from there.',
  loading: 'Loading the form…',

  errors: {
    generic: 'Something went wrong on our side. Your details are still here — try again.',
    rateLimited: 'That is a lot of requests from one place. Try again in an hour.',
    turnstile: 'We could not verify that you are human. Reload the page and try again.',
    network: 'We could not reach the server. Check your connection and try again.',
    summary: 'Please fix the highlighted fields.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Privacy                                                             */
/* ------------------------------------------------------------------ */

export const privacy = {
  title: 'Privacy',
  draftNotice: 'Draft — review before public launch.',
  updated: 'Last updated 26 September 2026',
  intro:
    'AI Cockpit is run by a solo founder. This page explains, in plain English, what happens to the details you send through the demo request form. It is the only place on this site that collects anything about you.',
  sections: [
    {
      id: 'what',
      heading: 'What we collect',
      body: 'Only what you type into the demo request form: your name and phone number, and — if you choose to add them — your email address, company name, what kind of work you do, the tools you use, the best time to call, and a short description of what you want your agents to do. Nothing else. There are no analytics cookies, no advertising trackers and no third-party scripts beyond the anti-spam check described below.',
    },
    {
      id: 'why',
      heading: 'Why we collect it',
      body: 'To reply to your demo request and arrange a time to talk. That is the only purpose. We do not sell it, share it with anyone, or add you to a mailing list.',
    },
    {
      id: 'spam',
      heading: 'Anti-spam',
      body: 'The form uses Cloudflare Turnstile to tell humans from bots. It checks how the page behaves rather than who you are. We also store a one-way hash of your IP address — not the address itself — purely to stop the same source flooding the form.',
    },
    {
      id: 'where',
      heading: 'Where it is stored',
      body: 'In a Cloudflare D1 database, on Cloudflare infrastructure. The notification email we send ourselves goes through Resend. Both process data on servers in the EU and the US depending on routing.',
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      body: 'Up to 12 months from the day you send it, then it is deleted. If we end up working together, anything we keep after that is covered by whatever agreement we sign.',
    },
    {
      id: 'rights',
      heading: 'Seeing or deleting your data',
      body: 'Just reply to any email or message you receive from us and ask. We will send you a copy of what we hold, or delete it, within 30 days. You do not need to give a reason.',
    },
  ],
} as const;
