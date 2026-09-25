'use client';

import type { RefObject } from 'react';
import { useScroll, useTransform, type MotionValue } from 'motion/react';
import * as m from 'motion/react-m';
import type { problem } from '@/content/site';
import { MotionRoot } from '../motion/MotionRoot';
import { CHAOS_CARD_CLASS, CHAOS_LAYOUT, CHAOS_STACK, ChaosCardBody } from './Problem';

type Card = (typeof problem.cards)[number];

interface ChaosCardProps {
  card: Card;
  index: number;
  progress: MotionValue<number>;
}

/** One card: it wobbles while the section is pinned, then joins the stack. */
function ChaosCard({ card, index, progress }: ChaosCardProps) {
  const spot = CHAOS_LAYOUT[index] ?? CHAOS_LAYOUT[0];

  const left = useTransform(progress, [0, 0.55, 1], [spot.left, spot.left, CHAOS_STACK.left]);
  const top = useTransform(progress, [0, 0.55, 1], [spot.top, spot.top, CHAOS_STACK.top]);
  const rotate = useTransform(
    progress,
    [0, 0.3, 0.55, 1],
    [spot.rotate, spot.rotate + spot.wobble, spot.rotate, index * 1.6 - 3],
  );
  const scale = useTransform(progress, [0, 0.55, 1], [1, 1, 0.94]);

  return (
    <m.div style={{ left, top, rotate, scale, zIndex: index }} className={CHAOS_CARD_CLASS}>
      <ChaosCardBody card={card} />
    </m.div>
  );
}

interface ProblemStageProps {
  cards: readonly Card[];
  targetRef: RefObject<HTMLDivElement | null>;
}

/**
 * Scroll-linked layer for the Problem section. Loaded lazily — the static
 * layer in `Problem.tsx` renders the same cards at progress 0 until it arrives.
 */
export default function ProblemStage({ cards, targetRef }: ProblemStageProps) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  return (
    <MotionRoot>
      {cards.map((card, i) => (
        <ChaosCard key={card.id} card={card} index={i} progress={scrollYProgress} />
      ))}
    </MotionRoot>
  );
}
