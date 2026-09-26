'use client';

import { useRef } from 'react';
import { cta } from '@/content/site';
import { Button, type ButtonSize, type ButtonVariant } from '../ui/Button';
import { openDemoModal } from './demoModalStore';

interface RequestDemoButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Overrides the shared CTA label (the pricing cards say "Get early access"). */
  label?: string;
}

/**
 * The site's primary CTA. Opens the inquiry dialog, and falls back to the
 * `#request-demo` section when JavaScript has not loaded — the `href` is a real
 * anchor, so the button works as a link until hydration replaces the behaviour.
 */
export function RequestDemoButton({
  variant = 'primary',
  size = 'md',
  className,
  label,
}: RequestDemoButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Button
      ref={ref}
      href="#request-demo"
      variant={variant}
      size={size}
      className={className}
      data-cta="request-demo"
      onClick={(event) => {
        // Let modified clicks and middle-clicks behave like a normal link.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        openDemoModal(ref.current);
      }}
    >
      {label ?? cta.primary}
    </Button>
  );
}
