'use client';

import dynamic from 'next/dynamic';
import { howItWorks } from '@/content/site';
import { useNearViewport } from '../motion/useInView';
import { usePrefersReducedMotion } from '../three/useReducedMotion';
import { Container } from '../ui/Container';
import { HudMark } from '../ui/icons';
import { Section, SectionHeader } from '../ui/Section';

export type Step = (typeof howItWorks.steps)[number];

export const STEP_CARD_CLASS =
  'bg-surface border-line flex flex-col rounded-(--radius-card) border p-6 sm:p-7';

/** Inner markup of a step card, shared by the static and animated layers. */
export function StepCardBody({ step }: { step: Step }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-accent font-display text-[2.75rem] leading-none font-extrabold">
          {step.number}
        </span>
        <HudMark className="text-accent-bright/70 size-7" />
      </div>
      <h3 className="text-h3 text-ink mt-6">{step.title}</h3>
      <p className="text-body text-ink-soft mt-3 flex-1">{step.body}</p>
      <p className="text-muted text-label-s mt-6 font-mono uppercase">{step.tag}</p>
    </>
  );
}

/** Lazy Framer Motion layer: entrance stagger + the 01 → 02 → 03 connector. */
const HowItWorksStage = dynamic(() => import('./HowItWorksStage'), { ssr: false });

/** Three steps from agent to approval. */
export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const [nearRef, near] = useNearViewport<HTMLDivElement>();

  const animate = !reduced;

  return (
    <Section id="how-it-works" tone="paper">
      <Container>
        <SectionHeader
          eyebrow={howItWorks.eyebrow}
          heading={howItWorks.heading}
          sub={howItWorks.sub}
        />

        <div ref={nearRef} className="relative">
          {animate && near ? (
            <HowItWorksStage targetRef={nearRef} />
          ) : (
            <>
              {/* Static layer: connector already drawn, cards at rest. */}
              <div
                aria-hidden="true"
                className="bg-line absolute top-[86px] right-[16%] left-[16%] hidden h-px lg:block"
              >
                <div className="bg-accent h-full origin-left" />
              </div>

              <ol className="relative grid gap-6 lg:grid-cols-3 lg:gap-8">
                {howItWorks.steps.map((step) => (
                  <li key={step.id} className={STEP_CARD_CLASS}>
                    <StepCardBody step={step} />
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
