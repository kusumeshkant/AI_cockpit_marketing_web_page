'use client';

import { useEffect, useRef, useState } from 'react';
import { nav } from '@/content/site';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';
import { CloseIcon, MenuIcon } from '../ui/icons';
import { Logo } from '../ui/Logo';
import { RequestDemoButton } from '../inquiry/RequestDemoButton';

/** Sticky top navigation. Gains a blurred background once the page scrolls. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock the page behind the mobile sheet and close it on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    const trigger = menuButtonRef.current;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      // Send focus back to the trigger rather than to <body> (WCAG 2.4.3).
      trigger?.focus();
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled ? 'bg-bg/90 border-line border-b backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-6">
        <a href="#top" className="shrink-0 rounded-sm">
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
          onClick={() => setMenuOpen(true)}
          aria-label={nav.openMenu}
          aria-expanded={menuOpen}
          // #mobile-menu only exists while the sheet is open; referencing a
          // missing id is an invalid aria-controls value.
          aria-controls={menuOpen ? 'mobile-menu' : undefined}
          className="border-line-strong text-ink inline-flex size-11 items-center justify-center rounded-(--radius-btn) border lg:hidden"
        >
          <MenuIcon className="size-5" />
        </button>
      </Container>

      {menuOpen ? (
        <div
          id="mobile-menu"
          className="bg-bg/98 fixed inset-0 z-50 flex flex-col backdrop-blur-xl lg:hidden"
        >
          <Container className="flex h-18 shrink-0 items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={nav.closeMenu}
              autoFocus
              className="border-line-strong text-ink inline-flex size-11 items-center justify-center rounded-(--radius-btn) border"
            >
              <CloseIcon className="size-5" />
            </button>
          </Container>

          <Container className="flex flex-1 flex-col gap-2 pt-6">
            <nav aria-label="Mobile" className="flex flex-col">
              {nav.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-ink border-line font-display flex min-h-14 items-center border-b text-xl font-bold tracking-tight"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <RequestDemoButton className="mt-6 w-full" />
          </Container>
        </div>
      ) : null}
    </header>
  );
}
