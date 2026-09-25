'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Fires once when the element first comes within `margin` of the viewport.
 *
 * Used for two things: CSS-driven entrance animations that need no runtime,
 * and gating the `next/dynamic` import of a scroll scene's animated layer so
 * the Framer Motion chunk is fetched just before it is needed.
 */
export function useInView<T extends Element>(margin = '-40px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, inView];
}

/**
 * Same as `useInView`, but with a wide margin so a lazy chunk has time to
 * arrive before the section reaches the viewport.
 */
export function useNearViewport<T extends Element>(): [RefObject<T | null>, boolean] {
  return useInView<T>('800px');
}
