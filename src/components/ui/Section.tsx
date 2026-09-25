import type { ReactNode } from 'react';
import { cn } from './cn';
import { Container } from './Container';
import { Eyebrow, type EyebrowTone } from './Eyebrow';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** `paper` renders the alternate section background. */
  tone?: 'bg' | 'paper';
  bordered?: boolean;
}

/** A page section with the standard vertical rhythm. */
export function Section({ id, children, className, tone = 'bg', bordered }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-(--spacing-section)',
        tone === 'paper' ? 'bg-paper' : 'bg-bg',
        bordered && 'border-line border-y',
        className,
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  eyebrowTone?: EyebrowTone;
  heading: ReactNode;
  sub?: string;
  align?: 'left' | 'center';
  className?: string;
  headingId?: string;
}

/** Eyebrow + H2 + optional sub-copy, with the standard 56/28px gap below. */
export function SectionHeader({
  eyebrow,
  eyebrowTone,
  heading,
  sub,
  align = 'left',
  className,
  headingId,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-(--spacing-section-gap) flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
      <h2 id={headingId} className="text-h2 text-ink max-w-3xl">
        {heading}
      </h2>
      {sub ? <p className="text-body-l text-ink-soft max-w-2xl">{sub}</p> : null}
    </div>
  );
}

/** Full-width section wrapper that also applies the content container. */
export function SectionInner({ children, className }: { children: ReactNode; className?: string }) {
  return <Container className={className}>{children}</Container>;
}
