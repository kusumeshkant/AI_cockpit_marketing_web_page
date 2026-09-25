import type { ReactNode } from 'react';
import { cn } from './cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Centred content column. `--container-site` is the width of the content
 * itself; the fluid gutter sits outside it, so the full design frame is
 * 1200px + 2 x 120px = 1440px on desktop.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[calc(var(--container-site)+2*var(--spacing-gutter))] px-(--spacing-gutter)',
        className,
      )}
    >
      {children}
    </div>
  );
}
