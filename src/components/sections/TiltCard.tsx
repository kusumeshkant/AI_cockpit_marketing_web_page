'use client';

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../three/useReducedMotion';

const MAX_TILT = 6;

/**
 * Cursor tilt and glare, driven by CSS custom properties rather than motion
 * values. Only this leaf hydrates — the card's content is server-rendered and
 * passed in as children.
 */
export function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tiltEnabled = !reduced;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!tiltEnabled || !el || e.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--tilt-y', `${(px - 0.5) * 2 * MAX_TILT}deg`);
    el.style.setProperty('--tilt-x', `${(0.5 - py) * 2 * MAX_TILT}deg`);
    el.style.setProperty('--glare-x', `${px * 100}%`);
    el.style.setProperty('--glare-y', `${py * 100}%`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--glare-x', '50%');
    el.style.setProperty('--glare-y', '50%');
  }

  const style = {
    '--tilt-x': '0deg',
    '--tilt-y': '0deg',
    '--glare-x': '50%',
    '--glare-y': '50%',
    transform: tiltEnabled
      ? 'perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))'
      : undefined,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={style}
      className="bg-surface border-line relative h-full overflow-hidden rounded-(--radius-card) border p-6 transition-transform duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none"
    >
      {tiltEnabled ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--glare-x)_var(--glare-y),rgb(63_194_223/0.12),transparent_60%)]"
        />
      ) : null}
      {children}
    </div>
  );
}
