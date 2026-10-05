'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { nav } from '@/content/site';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';
import { CloseIcon, MenuIcon } from '../ui/icons';
import { Logo } from '../ui/Logo';
import { RequestDemoButton } from '../inquiry/RequestDemoButton';
import { openDemoModal } from '../inquiry/demoModalStore';

/** Tailwind's `lg` breakpoint — the desktop nav takes over from here. */
const DESKTOP_QUERY = '(min-width: 64rem)';

/** Sticky top navigation. Gains a blurred background once the page scrolls. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Section to scroll to once the sheet has closed and the page is unlocked. */
  const pendingHashRef = useRef<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // While the mobile sheet is open: lock the page, trap focus across the toggle
  // and the sheet, close on Escape and when the viewport grows to desktop.
  useEffect(() => {
    if (!menuOpen) return;

    const trigger = menuButtonRef.current;
    const focusables = () => [
      ...(trigger ? [trigger] : []),
      ...(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []),
    ];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;

      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;
      const active = document.activeElement as HTMLElement | null;

      if (!active || !list.includes(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onBreakpoint);

    const root = document.documentElement;
    const previous = { html: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onBreakpoint);
      root.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
      // Send focus back to the trigger rather than to <body> (WCAG 2.4.3).
      trigger?.focus({ preventScroll: true });

      // The page can only scroll once it is unlocked, so a tapped link's
      // section is scrolled to here. `scrollIntoView` follows the CSS
      // `scroll-behavior` (smooth, or instant under reduced motion) and
      // `scroll-padding-top`, exactly like a native anchor jump.
      const hash = pendingHashRef.current;
      pendingHashRef.current = null;
      if (hash) {
        history.pushState(null, '', hash);
        document.getElementById(hash.slice(1))?.scrollIntoView();
      }
    };
  }, [menuOpen]);

  /** In-page links while the sheet is open: close first, then scroll. */
  const onSheetLink = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!menuOpen) return;
      event.preventDefault();
      pendingHashRef.current = event.currentTarget.getAttribute('href');
      setMenuOpen(false);
    },
    [menuOpen],
  );

  /**
   * The sheet's CTA closes the sheet before opening the inquiry dialog, and
   * hands the dialog the menu toggle as its opener — the CTA itself is hidden
   * once the sheet closes, so focus could not return to it.
   */
  const onSheetCta = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(false);
    openDemoModal(menuButtonRef.current);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
          menuOpen
            ? 'bg-bg border-line border-b'
            : scrolled
              ? 'bg-bg/90 border-line border-b backdrop-blur-xl'
              : 'border-b border-transparent',
        )}
      >
        <Container className="flex h-18 items-center justify-between gap-6">
          <a href="#top" onClick={onSheetLink} className="shrink-0 rounded-sm">
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-soft hover:text-ink text-body-s rounded-sm font-semibold transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <RequestDemoButton size="sm" />
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? nav.closeMenu : nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="border-line-strong text-ink inline-flex size-11 items-center justify-center rounded-(--radius-btn) border lg:hidden"
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </Container>
      </header>

      {/*
       * A sibling of <header>, never a child: the header's `backdrop-filter`
       * makes it the containing block for `position: fixed` descendants, which
       * clamped the sheet to the 72px bar and let the page show through.
       * The sheet is fully opaque and sits directly under the bar.
       * Disclosure pattern, not a dialog: the toggle's aria-expanded /
       * aria-controls describe it, and the labelled <nav> inside is the landmark.
       */}
      <div
        ref={panelRef}
        id="mobile-menu"
        inert={!menuOpen}
        className={cn(
          'bg-bg fixed inset-x-0 top-18 bottom-0 z-[60] flex h-[calc(100dvh-4.5rem)] flex-col overflow-y-auto overscroll-contain lg:hidden',
          'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          'transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none',
          menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
        )}
      >
        <Container className="flex flex-1 flex-col pt-4">
          <nav aria-label="Mobile" className="flex flex-col">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={onSheetLink}
                className="text-ink border-line font-display flex min-h-14 items-center border-b text-xl font-bold tracking-tight"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto pt-10" onClickCapture={onSheetCta}>
            <RequestDemoButton className="w-full" />
          </div>
        </Container>
      </div>
    </>
  );
}
