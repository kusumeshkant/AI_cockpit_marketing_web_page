import type { ReactNode } from 'react';
import { cn } from './cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Opaque surface card. */
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-surface border-line rounded-(--radius-card) border p-6', className)}>
      {children}
    </div>
  );
}

/** Translucent, blurred card used for anything that floats above the page. */
export function GlassCard({ children, className }: CardProps) {
  return <div className={cn('glass rounded-(--radius-card)', className)}>{children}</div>;
}
