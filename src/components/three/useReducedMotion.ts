'use client';

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { breakpoints } from '@/styles/tokens';

/**
 * Subscribes to a media query through `useSyncExternalStore`, so the value is
 * read during render rather than written from an effect. The server snapshot is
 * always `false`, which keeps the first client render identical to the HTML.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  };
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** `prefers-reduced-motion: reduce`. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** True once the viewport is at least `md` (768px) wide. */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.md}px)`);
}

interface NavigatorWithConnection extends Navigator {
  connection?: { saveData?: boolean };
}

/** Heuristic for devices that should not pay for a WebGL canvas. */
function isLowEndDevice(): boolean {
  const nav = navigator as NavigatorWithConnection;
  if (nav.connection?.saveData) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true;
  return false;
}

function hasWebGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Probing WebGL support costs a context, so the answer is computed once. */
let capabilityCache: boolean | null = null;

function getDeviceCapability(): boolean {
  capabilityCache ??= !isLowEndDevice() && hasWebGl();
  return capabilityCache;
}

const neverChanges = () => () => {};

/**
 * Whether the R3F hero canvas may render at all: desktop/tablet only, motion
 * allowed, capable device, WebGL present. Always `false` on the server and on
 * the first client render, so the static markup ships first and the 3D chunk
 * stays off the critical path.
 */
export function useCan3d(): boolean {
  const capable = useSyncExternalStore(neverChanges, getDeviceCapability, () => false);
  const isDesktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  return capable && isDesktop && !reduced;
}

/**
 * Defers a flag until the element has been near the viewport *and* the browser
 * is idle — used to keep the 3D chunk out of the initial load.
 */
export function useIdleInView(ref: RefObject<Element | null>, enabled: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || ready) return;
    const el = ref.current;
    if (!el) return;

    let idleHandle: number | undefined;
    const schedule = () => {
      const ric = window.requestIdleCallback;
      idleHandle = ric
        ? ric(() => setReady(true), { timeout: 2000 })
        : window.setTimeout(() => setReady(true), 300);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          schedule();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (idleHandle !== undefined) {
        if (window.cancelIdleCallback) window.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
    };
  }, [ref, enabled, ready]);

  return ready;
}
