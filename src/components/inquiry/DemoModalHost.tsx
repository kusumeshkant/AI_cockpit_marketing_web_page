'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { inquiry } from '@/content/site';
import { CloseIcon } from '../ui/icons';
import { closeDemoModal, useDemoModalOpen } from './demoModalStore';

/** The form and its Turnstile script are a separate chunk, fetched on open. */
const InquiryForm = dynamic(() => import('./InquiryForm').then((m) => m.InquiryForm), {
  ssr: false,
});

/**
 * Mounted once per page. Renders nothing until a CTA opens it, so the form,
 * its validation and the Turnstile loader stay off the initial bundle.
 */
export function DemoModalHost() {
  const open = useDemoModalOpen();
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDemoModal();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const list = [...focusable].filter(
        (el) => el.offsetParent !== null || el === heading.current,
      );
      const first = list[0];
      const last = list[list.length - 1];
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    heading.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-inquiry-title"
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10 sm:p-6 sm:py-12"
    >
      <button
        type="button"
        aria-label={inquiry.close}
        tabIndex={-1}
        onClick={closeDemoModal}
        className="bg-bg/85 fixed inset-0 cursor-default backdrop-blur-sm"
      />

      <div
        ref={panel}
        className="glass relative w-full max-w-2xl rounded-(--radius-panel) p-5 sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="demo-inquiry-title"
              ref={heading}
              tabIndex={-1}
              className="text-h3 text-ink outline-none"
            >
              {inquiry.title}
            </h2>
            <p className="text-body text-ink-soft mt-1.5">{inquiry.sub}</p>
          </div>
          <button
            type="button"
            onClick={closeDemoModal}
            aria-label={inquiry.close}
            className="border-line-strong text-ink inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius-btn) border"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <InquiryForm onDone={closeDemoModal} />
      </div>
    </div>
  );
}
