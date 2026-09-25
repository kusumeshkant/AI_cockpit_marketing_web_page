'use client';

import dynamic from 'next/dynamic';
import { approveMoment } from '@/content/site';
import { DetailScreen } from '../mock/DetailScreen';
import { PhoneFrame } from '../mock/PhoneFrame';
import { useNearViewport } from '../motion/useInView';
import { useIsDesktop, usePrefersReducedMotion } from '../three/useReducedMotion';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { featureIcons } from '../ui/icons';
import { Pill } from '../ui/Pill';

export type Feature = (typeof approveMoment.features)[number];

export const PHONE_CLASS =
  'h-[580px] w-[286px] shadow-[var(--shadow-deep),0_0_80px_rgb(75_189_131/0.25)] sm:h-[620px] sm:w-[306px]';

/** The phone showing the action-detail screen, shared by both layers. */
export function ApprovePhone() {
  return (
    <PhoneFrame
      label={approveMoment.phoneAlt}
      className={PHONE_CLASS}
      screenClassName="ring-1 ring-go/25"
    >
      <DetailScreen />
    </PhoneFrame>
  );
}

/** Inner markup of a feature row, shared by both layers. */
export function FeatureRowBody({ feature }: { feature: Feature }) {
  const Icon = featureIcons[feature.icon];
  return (
    <>
      <span className="bg-accent-wash text-accent-bright border-accent/30 flex size-11 shrink-0 items-center justify-center rounded-(--radius-card-sm) border">
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="text-h4 text-ink flex flex-wrap items-center gap-2">
          {feature.title}
          {'badge' in feature && feature.badge ? <Pill tone="beta">{feature.badge}</Pill> : null}
        </h3>
        <p className="text-body text-ink-soft mt-1.5">{feature.body}</p>
      </div>
    </>
  );
}

/** Lazy Framer Motion layer: the pinned approve-and-resume choreography. */
const ApproveStage = dynamic(() => import('./ApproveStage'), { ssr: false });

/**
 * The payoff section: the phone straightens as you scroll, the Approve button
 * pulses, and a card flies back out towards the agent.
 */
export function ApproveMoment() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const [nearRef, near] = useNearViewport<HTMLDivElement>();

  const animate = !reduced && isDesktop;

  return (
    <div ref={nearRef} className={cn('relative', animate && 'h-[190vh]')}>
      <section
        className={cn('bg-bg', animate ? 'sticky top-0 flex min-h-screen items-center' : '')}
      >
        <div className="w-full py-(--spacing-section)">
          <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            {/* ---- Phone ---- */}
            <div className="stage-3d relative order-2 flex justify-center lg:order-1">
              <div
                aria-hidden="true"
                className="radial-glow-go pointer-events-none absolute inset-0 blur-xl"
              />
              {animate && near ? (
                <ApproveStage targetRef={nearRef} />
              ) : (
                <div className="relative">
                  <ApprovePhone />
                </div>
              )}
            </div>

            {/* ---- Copy + feature rows ---- */}
            <div className="order-1 lg:order-2">
              <Eyebrow>{approveMoment.eyebrow}</Eyebrow>
              <h2 className="text-h2-sub text-ink mt-4">{approveMoment.heading}</h2>

              <ul className="mt-10 flex flex-col gap-7">
                {approveMoment.features.map((feature) => (
                  <li key={feature.id} className="flex gap-4">
                    <FeatureRowBody feature={feature} />
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>
      </section>
    </div>
  );
}
