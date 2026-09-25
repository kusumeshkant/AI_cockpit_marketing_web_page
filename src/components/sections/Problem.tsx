'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import { problem } from '@/content/site';
import { useNearViewport } from '../motion/useInView';
import { useIsDesktop, usePrefersReducedMotion } from '../three/useReducedMotion';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';
import { Eyebrow } from '../ui/Eyebrow';

/** Scattered resting position of each chaos card, as percentages of the stage. */
export const CHAOS_LAYOUT = [
  { top: '2%', left: '4%', rotate: -7, wobble: -3 },
  { top: '20%', left: '38%', rotate: 5, wobble: 4 },
  { top: '42%', left: '2%', rotate: -3, wobble: 3 },
  { top: '58%', left: '42%', rotate: 8, wobble: -4 },
  { top: '78%', left: '14%', rotate: -5, wobble: 3 },
] as const;

/** Where the cards collapse to once the pinned scroll completes. */
export const CHAOS_STACK = { left: '18%', top: '34%' } as const;

export const CHAOS_CARD_CLASS =
  'glass absolute w-[62%] rounded-(--radius-card-sm) p-3.5 sm:w-[56%]';

/** Inner markup of a chaos card, shared by the static and animated layers. */
export function ChaosCardBody({ card }: { card: (typeof problem.cards)[number] }) {
  return (
    <>
      <p className="text-stop/80 text-label-s font-mono uppercase">{card.source}</p>
      <p className="text-ink-soft mt-1.5 text-[0.8125rem] leading-snug">{card.text}</p>
    </>
  );
}

/**
 * The animated layer lives behind a `next/dynamic` boundary, so the Framer
 * Motion runtime is fetched only when this section nears the viewport.
 */
const ProblemStage = dynamic(() => import('./ProblemStage'), { ssr: false });

/** The scattered-approvals problem, told with a pile of chat/email cards. */
export function Problem() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const [nearRef, near] = useNearViewport<HTMLDivElement>();

  const animate = !reduced && isDesktop;

  // Mobile shows only the first three cards (§7.4).
  const cards = isDesktop ? problem.cards : problem.cards.slice(0, 3);

  return (
    <div ref={nearRef} className={cn('relative', animate && 'h-[190vh]')}>
      <section
        className={cn('bg-bg', animate ? 'sticky top-0 flex min-h-screen items-center' : '')}
      >
        <div className="w-full py-(--spacing-section)">
          <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow tone="stop">{problem.eyebrow}</Eyebrow>
              <h2 className="text-h2 text-ink mt-4">{problem.heading}</h2>
              <p className="text-body-l text-ink-soft mt-6 max-w-xl">{problem.body}</p>
            </div>

            <div
              className="relative h-[420px] w-full sm:h-[460px]"
              aria-label="Approval requests scattered across chat and email"
              role="img"
            >
              <div
                aria-hidden="true"
                className="radial-glow-stop pointer-events-none absolute inset-0 rounded-full blur-2xl"
              />

              {animate && near ? (
                <ProblemStage cards={cards} targetRef={nearRef} />
              ) : (
                /* Static layer: identical markup at scroll progress 0. */
                cards.map((card, i) => {
                  const spot = CHAOS_LAYOUT[i] ?? CHAOS_LAYOUT[0];
                  const style: CSSProperties = {
                    left: spot.left,
                    top: spot.top,
                    transform: `rotate(${spot.rotate}deg)`,
                    zIndex: i,
                  };
                  return (
                    <div key={card.id} style={style} className={CHAOS_CARD_CLASS}>
                      <ChaosCardBody card={card} />
                    </div>
                  );
                })
              )}
            </div>
          </Container>
        </div>
      </section>
    </div>
  );
}
