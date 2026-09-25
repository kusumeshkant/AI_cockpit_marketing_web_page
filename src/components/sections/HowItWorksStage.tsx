'use client';

import type { RefObject } from 'react';
import { useScroll, useTransform } from 'motion/react';
import * as m from 'motion/react-m';
import { howItWorks } from '@/content/site';
import { MotionRoot } from '../motion/MotionRoot';
import { STEP_CARD_CLASS, StepCardBody } from './HowItWorks';

/**
 * Scroll-linked layer for "How it works": the step cards tilt into place and a
 * teal connector draws from 01 to 03 as the section passes the viewport.
 */
export default function HowItWorksStage({
  targetRef,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 85%', 'center 55%'],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <MotionRoot>
      <div
        aria-hidden="true"
        className="bg-line absolute top-[86px] right-[16%] left-[16%] hidden h-px lg:block"
      >
        <m.div className="bg-accent h-full origin-left" style={{ scaleX: lineScale }} />
      </div>

      <ol className="relative grid gap-6 lg:grid-cols-3 lg:gap-8">
        {howItWorks.steps.map((step, i) => (
          <m.li
            key={step.id}
            initial={{ opacity: 0, y: 40, rotateX: 14 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1000 }}
            className={STEP_CARD_CLASS}
          >
            <StepCardBody step={step} />
          </m.li>
        ))}
      </ol>
    </MotionRoot>
  );
}
