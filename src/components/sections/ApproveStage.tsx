'use client';

import type { RefObject } from 'react';
import { useScroll, useTransform } from 'motion/react';
import * as m from 'motion/react-m';
import { approveMoment } from '@/content/site';
import { MotionRoot } from '../motion/MotionRoot';
import { ApprovePhone } from './ApproveMoment';

/**
 * Scroll-linked layer for the approve moment: the phone straightens, a green
 * ring pulses out of the Approve button, and the decided action flies back
 * towards the agent.
 */
export default function ApproveStage({
  targetRef,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const phoneRotate = useTransform(scrollYProgress, [0, 0.6], [5, 0]);
  const ringScale = useTransform(scrollYProgress, [0.45, 0.85], [0.6, 2.4]);
  const ringOpacity = useTransform(scrollYProgress, [0.45, 0.7, 0.85], [0, 0.6, 0]);
  const resumeX = useTransform(scrollYProgress, [0.7, 1], [0, -190]);
  const resumeY = useTransform(scrollYProgress, [0.7, 1], [0, -160]);
  const resumeOpacity = useTransform(scrollYProgress, [0.68, 0.78, 1], [0, 1, 0]);

  return (
    <MotionRoot>
      <m.div className="relative" style={{ rotate: phoneRotate }}>
        <ApprovePhone />

        {/* Green pulse expanding from the Approve button. */}
        <m.span
          aria-hidden="true"
          className="border-go pointer-events-none absolute right-10 bottom-12 size-16 rounded-full border-2"
          style={{ scale: ringScale, opacity: ringOpacity }}
        />
      </m.div>

      {/* The decided action flying back out to the agent. */}
      <m.div
        aria-hidden="true"
        className="glass pointer-events-none absolute top-16 left-1/2 w-[190px] rounded-(--radius-card-sm) p-3"
        style={{ x: resumeX, y: resumeY, opacity: resumeOpacity }}
      >
        <p className="text-go text-label-s font-mono uppercase">APPROVED · CALLBACK SENT</p>
        <p className="text-ink-soft mt-1 text-[0.75rem] leading-snug">
          {approveMoment.detail.title}
        </p>
      </m.div>
    </MotionRoot>
  );
}
