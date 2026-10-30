/*
 * Legal pages: Privacy (app + website form), Terms of Service, Account deletion.
 *
 * Every claim here has to match what the app and backend actually do. When a
 * data flow changes (a new SDK, PostHog switched on, Agent Triggers enabled in
 * the cloud), update this file and the Play Console Data safety form together.
 */

/** One block of a legal page: `body` paragraphs, then `items` as a list, then `note`. */
export interface LegalSection {
  readonly id: string;
  readonly heading: string;
  readonly body?: readonly string[];
  readonly items?: readonly string[];
  readonly note?: string;
}

/** A titled group of sections (Privacy has one part for the app, one for the website). */
export interface LegalPart {
  readonly id: string;
  readonly heading: string;
  readonly sections: readonly LegalSection[];
}

export interface LegalDoc {
  readonly title: string;
  readonly description: string;
  readonly updated: string;
  readonly intro: readonly string[];
  readonly parts: readonly LegalPart[];
}

/**
 * Pages Play Console links to. They stay crawlable even on noindex builds
 * (robots.txt, X-Robots-Tag, meta robots); scripts/headers.mjs keeps its own
 * copy of this list and tests/legal-pages.spec.ts checks the two match.
 */
export const LEGAL_PATHS = ['/privacy', '/terms', '/delete-account'] as const;

export const operator = {
  name: 'Kusumeshkant Sharma',
  form: 'sole proprietor',
  place: 'Bengaluru, India',
  email: 'kusumeshkantsharma@gmail.com',
} as const;

const UPDATED = 'Last updated 30 October 2026';

/* ------------------------------------------------------------------ */
/* Privacy                                                             */
/* ------------------------------------------------------------------ */

export const privacy: LegalDoc = {
  title: 'Privacy Policy',
  description:
    'What the AI Cockpit app and the aicockpit.dqstore.in website collect, why, who processes it, and how to have it deleted.',
  updated: UPDATED,
  intro: [
    `AI Cockpit is run by ${operator.name}, a ${operator.form} in ${operator.place} ("we", "us"). This policy explains, in plain English, what happens to your information when you use the AI Cockpit mobile app (package app.aicockpit.aicockpit) and this website.`,
    `Questions or requests: ${operator.email}.`,
  ],
  parts: [
    {
      id: 'app',
      heading: 'The AI Cockpit app',
      sections: [
        {
          id: 'app-what',
          heading: 'What the app does',
          body: [
            'AI Cockpit lets you review actions that your own AI agents and automations (for example n8n, Make, Zapier or custom code) propose, and approve, edit or reject them from your phone. Your agent sends a proposed action to our backend, you decide, and we send your decision back to the address your agent gave us.',
          ],
        },
        {
          id: 'app-collect',
          heading: 'What we collect',
          items: [
            'Your email address. You sign in with a one-time code we email to you, so we need it to create your account and sign you in.',
            'Account details: an account ID, the workspace you belong to and your role in it (owner or approver).',
            'A push notification token for your device. It lets us alert you when a new action is waiting. You can turn notifications off in your phone’s settings; the app works without them.',
            'Agent connection details you enter: the agent’s name, which platform it runs on and the callback address where decisions are sent. Each agent also gets a signing secret. It is shown to you once and stored encrypted.',
            'The content of actions your agents send for review, such as a drafted email, a change to a document or a table of rows. This is whatever your agent sends; it can include personal information about other people (for example the recipient of a drafted email).',
            'Your decisions and an audit log: who approved, edited or rejected which action, when, and whether the agent received the decision.',
            'Crash reports. When the app crashes or hits an error, a report is sent to our crash-reporting provider with the error details, app version, device model, operating system version and a random ID for this installation of the app. Reports do not include your email address or account ID, and we set the provider not to store IP addresses.',
          ],
        },
        {
          id: 'app-not',
          heading: 'What we do not collect',
          body: [
            'We do not collect your location, contacts, photos, files, browsing history or advertising ID. The app shows no ads, uses no advertising or analytics trackers, and we never sell your information.',
          ],
        },
        {
          id: 'app-device',
          heading: 'Stored on your phone',
          body: [
            'Your sign-in session is kept in your phone’s secure storage and is removed when you sign out. Your theme and language choices are kept in the app’s local settings. Uninstalling the app removes both.',
          ],
        },
        {
          id: 'app-use',
          heading: 'How we use it',
          items: [
            'To sign you in and keep your account and workspace working.',
            'To show you the actions your agents send, record your decisions and deliver them back to your agent.',
            'To send push notifications you have allowed.',
            'To find and fix crashes and errors.',
            'To keep the service secure, for example verifying that an action really came from your agent and limiting abuse.',
          ],
        },
        {
          id: 'app-processors',
          heading: 'Who processes it for us',
          body: [
            'We use these service providers to run AI Cockpit. They process data only on our behalf:',
          ],
          items: [
            'Supabase: database, sign-in and backend functions. Data is stored in the ap-south-1 (Mumbai, India) region.',
            'Resend: sends the sign-in code emails.',
            'Google Firebase Cloud Messaging: delivers push notifications.',
            'Sentry: receives crash and error reports.',
          ],
        },
        {
          id: 'app-sharing',
          heading: 'Sharing',
          body: [
            'Your decisions are sent to the callback address of the agent you connected, because that is how the agent learns what you decided. Other members of your workspace can see the workspace’s actions, decisions and audit log. Apart from that and the service providers above, we share information only if the law requires it.',
          ],
        },
        {
          id: 'app-security',
          heading: 'Security',
          body: [
            'All traffic between the app, our backend and your agents uses encrypted connections (HTTPS). Every action an agent sends must carry a valid signature made with that agent’s secret. Database access is restricted so that people can only see their own workspace, and the audit log cannot be edited.',
          ],
        },
        {
          id: 'app-retention',
          heading: 'How long we keep it',
          body: [
            'We keep your account, agents, actions and audit log for as long as your account exists. When you delete your account, they are deleted as described on our account deletion page. Crash reports are kept by Sentry for a limited period under its retention settings and then removed.',
          ],
        },
        {
          id: 'app-delete',
          heading: 'Deleting your account',
          body: [
            'You can delete your account at any time in the app (Settings, then Delete account) or by emailing us. Details of what is deleted and what is kept are on the account deletion page at /delete-account.',
          ],
        },
        {
          id: 'app-rights',
          heading: 'Your choices and rights',
          body: [
            `You can ask us for a copy of the information we hold about you, ask us to correct it or ask us to delete it by emailing ${operator.email} from the address on your account. We reply within 30 days. You can turn push notifications off at any time in your phone’s settings.`,
          ],
        },
        {
          id: 'app-age',
          heading: 'Age',
          body: [
            'AI Cockpit is a business tool for adults. It is not meant for anyone under 18, and we do not knowingly collect information from children.',
          ],
        },
      ],
    },
    {
      id: 'website',
      heading: 'This website and the demo request form',
      sections: [
        {
          id: 'what',
          heading: 'What we collect',
          body: [
            'Only what you type into the demo request form: your name and phone number, and — if you choose to add them — your email address, company name, what kind of work you do, the tools you use, the best time to call, and a short description of what you want your agents to do. There are no analytics cookies, no advertising trackers and no third-party scripts beyond the anti-spam check described below.',
          ],
        },
        {
          id: 'why',
          heading: 'Why we collect it',
          body: [
            'To reply to your demo request and arrange a time to talk. That is the only purpose. We do not sell it, share it with anyone, or add you to a mailing list.',
          ],
        },
        {
          id: 'spam',
          heading: 'Anti-spam',
          body: [
            'The form uses Cloudflare Turnstile to tell humans from bots. It checks how the page behaves rather than who you are. We also store a one-way hash of your IP address — not the address itself — purely to stop the same source flooding the form.',
          ],
        },
        {
          id: 'where',
          heading: 'Where it is stored',
          body: [
            'In a Cloudflare D1 database, on Cloudflare infrastructure. The notification email we send ourselves goes through Resend. Both process data on servers in the EU and the US depending on routing.',
          ],
        },
        {
          id: 'retention',
          heading: 'How long we keep it',
          body: [
            'Up to 12 months from the day you send it, then it is deleted. If we end up working together, anything we keep after that is covered by whatever agreement we sign.',
          ],
        },
        {
          id: 'rights',
          heading: 'Seeing or deleting your data',
          body: [
            `Email ${operator.email} or reply to any message you receive from us. We will send you a copy of what we hold, or delete it, within 30 days. You do not need to give a reason.`,
          ],
        },
      ],
    },
    {
      id: 'changes',
      heading: 'Changes and contact',
      sections: [
        {
          id: 'changes-policy',
          heading: 'Changes to this policy',
          body: [
            'If we change what we collect or how we use it, we will update this page and the date at the top before the change takes effect. For significant changes we will also email account holders.',
          ],
        },
        {
          id: 'contact',
          heading: 'Contact',
          body: [`${operator.name}, ${operator.place}. Email: ${operator.email}.`],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Terms of Service                                                    */
/* ------------------------------------------------------------------ */

export const terms: LegalDoc = {
  title: 'Terms of Service',
  description: 'The terms for using the AI Cockpit app and service.',
  updated: UPDATED,
  intro: [
    `These terms are an agreement between you and ${operator.name}, a ${operator.form} in ${operator.place} ("we", "us"), for using the AI Cockpit mobile app and service ("AI Cockpit"). By creating an account or using AI Cockpit you agree to them. If you use AI Cockpit for a company, you confirm you may accept these terms for it.`,
  ],
  parts: [
    {
      id: 'terms',
      heading: 'Terms',
      sections: [
        {
          id: 'service',
          heading: '1. The service',
          body: [
            'AI Cockpit lets you connect your own AI agents and automations, review the actions they propose, and approve, edit or reject them. AI Cockpit does not run your agents and does not carry out actions itself: it sends your decision back to your agent, and your agent acts on it.',
          ],
        },
        {
          id: 'eligibility',
          heading: '2. Who can use it',
          body: [
            'You must be at least 18 and able to enter into a binding agreement. You need a valid email address to sign in.',
          ],
        },
        {
          id: 'account',
          heading: '3. Your account',
          body: [
            'Keep access to your email and your phone secure: anyone who can read your sign-in codes can use your account. Workspace owners decide who can approve actions in their workspace and are responsible for what members do there. Tell us promptly if you think your account has been misused.',
          ],
        },
        {
          id: 'responsibility',
          heading: '4. Your agents and your decisions',
          body: [
            'You are responsible for the agents you connect, the content they send, the decisions you make in AI Cockpit, and what your agents do with those decisions. Review each action carefully before you approve it. Approving an action means you accept responsibility for it.',
            'You must have the right to send us the content your agents submit, including any personal information about other people in it, and to have us process it to provide the service.',
          ],
        },
        {
          id: 'acceptable-use',
          heading: '5. Acceptable use',
          body: ['Do not use AI Cockpit to:'],
          items: [
            'break the law or anyone else’s rights, or send spam, fraud or harmful content through your agents;',
            'try to get into other people’s accounts or workspaces, or around our security or limits;',
            'overload, attack, reverse engineer or interfere with the service;',
            'resell or provide AI Cockpit to others as your own service without our written permission.',
          ],
        },
        {
          id: 'privacy',
          heading: '6. Privacy',
          body: [
            'Our Privacy Policy at /privacy explains what we collect and how we use it. You can delete your account at any time; see /delete-account.',
          ],
        },
        {
          id: 'availability',
          heading: '7. Availability and changes',
          body: [
            'We work to keep AI Cockpit running, but we do not promise it will always be available, error-free or deliver every notification on time. Do not rely on it as the only safeguard for critical actions. We may change, suspend or stop features; for significant changes we will tell you in advance where we reasonably can.',
          ],
        },
        {
          id: 'price',
          heading: '8. Price',
          body: [
            'The app is currently free to download and use. If we introduce paid plans, we will tell you the price and terms before you are charged, and you can choose not to sign up.',
          ],
        },
        {
          id: 'ip',
          heading: '9. Ownership',
          body: [
            'You keep all rights to the content your agents send. You give us permission to store and process it only to provide AI Cockpit to you. We own AI Cockpit itself, including the app, its design and its code.',
          ],
        },
        {
          id: 'disclaimer',
          heading: '10. Disclaimer',
          body: [
            'AI Cockpit is provided "as is" and "as available". To the extent the law allows, we make no warranties beyond those in these terms, including fitness for a particular purpose.',
          ],
        },
        {
          id: 'liability',
          heading: '11. Limitation of liability',
          body: [
            'To the extent the law allows, we are not liable for indirect or consequential loss, lost profits or lost data, or for actions your agents take after you approve them. Our total liability for any claim relating to AI Cockpit is limited to the amount you paid us for it in the 12 months before the claim, or INR 1,000 if you paid nothing. Nothing in these terms limits liability that cannot be limited by law.',
          ],
        },
        {
          id: 'ending',
          heading: '12. Ending',
          body: [
            'You can stop using AI Cockpit and delete your account at any time. We may suspend or close an account that breaks these terms or puts the service or other users at risk; where reasonable we will tell you first.',
          ],
        },
        {
          id: 'law',
          heading: '13. Governing law',
          body: [
            'These terms are governed by the laws of India. The courts in Bengaluru, Karnataka have exclusive jurisdiction over any dispute about them.',
          ],
        },
        {
          id: 'changes',
          heading: '14. Changes to these terms',
          body: [
            'We may update these terms. We will change the date at the top and, for significant changes, email you before they apply. If you keep using AI Cockpit after that, the new terms apply.',
          ],
        },
        {
          id: 'contact',
          heading: '15. Contact',
          body: [`${operator.name}, ${operator.place}. Email: ${operator.email}.`],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Account deletion                                                    */
/* ------------------------------------------------------------------ */

export const accountDeletion: LegalDoc = {
  title: 'Delete your AI Cockpit account',
  description:
    'How to delete your AI Cockpit account and data, what is deleted, what is kept, and how long it takes.',
  updated: UPDATED,
  intro: [
    `This page explains how to delete your account in AI Cockpit, the app by ${operator.name} on Google Play. You can do it in the app, or by email if you no longer have the app.`,
  ],
  parts: [
    {
      id: 'deletion',
      heading: 'Account deletion',
      sections: [
        {
          id: 'in-app',
          heading: 'Delete in the app',
          items: [
            'Open AI Cockpit and sign in.',
            'Go to Settings and tap Delete account.',
            'Read what will be deleted, type your email to confirm and tap Delete my account.',
          ],
          note: 'Your account is deleted straight away and that device stops getting notifications.',
        },
        {
          id: 'by-email',
          heading: 'Request deletion by email',
          body: [
            `Email ${operator.email} from the email address you sign in with, with the subject "Delete my AI Cockpit account". We may ask you to confirm the request from that address. We complete email requests within 30 days and reply to confirm.`,
          ],
        },
        {
          id: 'deleted',
          heading: 'What is deleted',
          items: [
            'Your sign-in account, sessions and email address.',
            'Your profile, role and push notification tokens.',
            'If you own a workspace: the whole workspace, including its agents, agent secrets, actions and audit log. Other members of the workspace keep their accounts and are moved to new workspaces of their own.',
            'If you are an approver in someone else’s workspace: your profile is deleted, and your past decisions stay in that workspace’s audit log with your name removed, because the owner needs a record of what was approved.',
          ],
        },
        {
          id: 'kept',
          heading: 'What is kept',
          items: [
            'A deletion record with no personal details: a one-way hash of your account ID, the date, and counts of what was deleted. It lets us prove the deletion happened.',
            'Crash reports already sent to our crash-reporting provider, until they expire under its retention period. They do not include your email address.',
            'Anything your agents already received from us, such as decisions sent to their callback address. That sits in your own systems, not ours.',
          ],
        },
        {
          id: 'contact',
          heading: 'Questions',
          body: [`Email ${operator.email}.`],
        },
      ],
    },
  ],
};
