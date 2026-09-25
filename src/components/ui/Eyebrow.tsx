import type { ReactNode } from 'react';
import { cn } from './cn';

export type EyebrowTone = 'accent' | 'stop' | 'go' | 'muted';

const toneClass: Record<EyebrowTone, string> = {
  accent: 'text-accent-bright',
  stop: 'text-stop',
  go: 'text-go',
  muted: 'text-muted',
};

interface EyebrowProps {
  children: ReactNode;
  tone?: EyebrowTone;
  className?: string;
}

/** Mono uppercase section label. */
export function Eyebrow({ children, tone = 'accent', className }: EyebrowProps) {
  return (
    <p className={cn('text-label font-mono uppercase', toneClass[tone], className)}>{children}</p>
  );
}

/** Hero variant: a pill on `accentWash` with a glowing dot. */
export function HeroEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'bg-accent-wash border-accent/40 text-accent-ink text-label inline-flex items-center gap-2.5 rounded-(--radius-pill) border px-4 py-2 font-mono uppercase',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="bg-accent-bright size-2 shrink-0 rounded-full shadow-[0_0_10px_3px_rgb(63_194_223/0.65)]"
      />
      {children}
    </p>
  );
}
