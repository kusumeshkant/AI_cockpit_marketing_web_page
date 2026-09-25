'use client';

import type { ReactNode } from 'react';
import { LazyMotion } from 'motion/react';

/** Feature bundle loader — a separate chunk, fetched with the scene that needs it. */
const loadFeatures = () => import('./features').then((mod) => mod.default);

/**
 * Wraps a scroll scene's animated subtree.
 *
 * This component is only ever reached through a `next/dynamic` boundary, so
 * the Framer Motion runtime stays out of the initial bundle entirely. `strict`
 * makes `motion.*` a build error, forcing every scene onto the `m.*` components
 * that the lazy feature bundle powers.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
