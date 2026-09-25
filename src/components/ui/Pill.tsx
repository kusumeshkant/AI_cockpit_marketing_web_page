import { cn } from './cn';

export type PillTone = 'pending' | 'approved' | 'rejected' | 'live' | 'beta';

const toneClass: Record<PillTone, { wrap: string; dot: string }> = {
  pending: { wrap: 'bg-pending-bg text-pending', dot: 'bg-pending' },
  approved: { wrap: 'bg-go-bg text-go', dot: 'bg-go' },
  rejected: { wrap: 'bg-stop-bg text-stop', dot: 'bg-stop' },
  live: { wrap: 'bg-accent-wash text-accent-ink', dot: 'bg-accent-bright' },
  beta: { wrap: 'bg-accent-wash text-accent-ink', dot: 'bg-accent' },
};

interface PillProps {
  tone: PillTone;
  children: string;
  className?: string;
  /** Hide the leading dot (used by the "MOST POPULAR" pricing pill). */
  dotless?: boolean;
}

/** Status pill: a 6px dot plus a mono uppercase label. */
export function Pill({ tone, children, className, dotless }: PillProps) {
  const t = toneClass[tone];
  return (
    <span
      className={cn(
        'text-label-s inline-flex items-center gap-1.5 rounded-(--radius-pill) px-2.5 py-1 font-mono uppercase',
        t.wrap,
        className,
      )}
    >
      {dotless ? null : (
        <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', t.dot)} />
      )}
      {children}
    </span>
  );
}
