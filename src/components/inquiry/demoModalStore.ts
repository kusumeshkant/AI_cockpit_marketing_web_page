'use client';

import { useSyncExternalStore } from 'react';

/**
 * A module-level store rather than React context.
 *
 * The CTAs live in six different server-rendered sections, so a context
 * provider would have to wrap the whole page and turn all of it into a client
 * component. Every client island shares this one module instance instead, which
 * keeps the sections static.
 */

let open = false;
/** Whatever opened the dialog, so focus can go back there on close. */
let opener: HTMLElement | null = null;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function openDemoModal(trigger?: HTMLElement | null) {
  opener = trigger ?? (document.activeElement as HTMLElement | null);
  open = true;
  emit();
}

export function closeDemoModal() {
  open = false;
  emit();
  // Let React unmount the dialog before moving focus.
  const target = opener;
  opener = null;
  queueMicrotask(() => target?.focus?.());
}

/** `false` during SSR and the first client render, so markup stays stable. */
export function useDemoModalOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
