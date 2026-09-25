'use client';

import { useEffect, useRef } from 'react';
import { cta, DEMO_URL, demoModal } from '@/content/site';
import { Button } from './ui/Button';
import { CloseIcon, PlayIcon } from './ui/icons';

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Lightweight dialog holding the 60-second demo. The video itself lands later —
 * until then the modal shows an honest placeholder plus the booking CTA.
 */
export function DemoModal({ open, onClose }: DemoModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      // Simple focus trap across the panel's focusable children.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
    >
      <button
        type="button"
        aria-label={demoModal.close}
        onClick={onClose}
        className="bg-bg/80 absolute inset-0 cursor-default backdrop-blur-sm"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        className="glass relative w-full max-w-2xl rounded-(--radius-panel) p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="demo-modal-title" className="text-ink font-display text-2xl font-bold">
              {demoModal.title}
            </h2>
            <p className="text-ink-soft text-body mt-1">{demoModal.subtitle}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={demoModal.close}
            className="border-line-strong text-ink inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius-btn) border"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="bg-bg border-line mt-6 flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-(--radius-card) border px-6 text-center">
          <span className="bg-accent-wash text-accent-bright border-accent/40 flex size-14 items-center justify-center rounded-full border">
            <PlayIcon className="size-6" />
          </span>
          <p className="text-muted text-body max-w-sm">{demoModal.placeholder}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button href={DEMO_URL} data-cta="book-demo">
            {cta.primary}
          </Button>
        </div>
      </div>
    </div>
  );
}
