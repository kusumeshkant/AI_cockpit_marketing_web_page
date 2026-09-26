'use client';

import dynamic from 'next/dynamic';
import { inquiry } from '@/content/site';
import { useNearViewport } from '../motion/useInView';
import { Container } from '../ui/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { Section } from '../ui/Section';

/**
 * The form shares one lazy chunk with the dialog, so it is fetched on whichever
 * happens first: a CTA opening the dialog, or this section nearing the viewport.
 */
const InquiryForm = dynamic(() => import('../inquiry/InquiryForm').then((m) => m.InquiryForm), {
  ssr: false,
  loading: () => <p className="text-muted text-body">{inquiry.loading}</p>,
});

/**
 * The form as a real page section, and the target of every CTA's `href` — so
 * the CTAs are working links before hydration and `/#request-demo` is a
 * permanent address for the form.
 *
 * Turnstile is a script, so a genuinely script-free submission is impossible.
 * Rather than render a form that cannot submit, a `<noscript>` says so plainly.
 */
export function RequestDemo() {
  const [ref, near] = useNearViewport<HTMLDivElement>();

  return (
    <Section id="request-demo" tone="paper">
      <Container className="max-w-3xl">
        <div className="mb-(--spacing-section-gap) flex flex-col gap-4">
          <Eyebrow>{inquiry.sectionEyebrow}</Eyebrow>
          <h2 className="text-h2-sub text-ink">{inquiry.title}</h2>
          <p className="text-body-l text-ink-soft max-w-2xl">{inquiry.sub}</p>
        </div>

        <noscript>
          <p className="border-line bg-surface text-body text-ink-soft rounded-(--radius-card) border p-5">
            {inquiry.noscript}
          </p>
        </noscript>

        {/* min-height keeps the swap from shifting the page (CLS). */}
        <div ref={ref} className="min-h-[32rem]">
          {near ? <InquiryForm /> : null}
        </div>
      </Container>
    </Section>
  );
}
