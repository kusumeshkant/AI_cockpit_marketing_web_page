import type { ActionItem, ActionStatus } from '@/content/site';
import { cn } from '../ui/cn';
import { Pill, type PillTone } from '../ui/Pill';

const statusPill: Record<ActionStatus, { tone: PillTone; label: string }> = {
  pending: { tone: 'pending', label: 'PENDING' },
  approved: { tone: 'approved', label: 'APPROVED' },
  rejected: { tone: 'rejected', label: 'REJECTED' },
};

interface ActionCardProps {
  action: ActionItem;
  className?: string;
  /** Adds the amber "waiting" pulse used when a signal lands in the hero. */
  pulsing?: boolean;
  /** Renders on a glass surface instead of `surface` (floating cards). */
  glass?: boolean;
}

/**
 * One row in the actions feed: source label + status pill, title, preview line.
 *
 * Decided actions recede via a softer border and title rather than the 60%
 * opacity the spec suggests: dimming the whole card drops its label text to
 * ~2.7:1, which fails WCAG AA. The de-emphasis reads the same.
 */
export function ActionCard({ action, className, pulsing, glass }: ActionCardProps) {
  const pill = statusPill[action.status];
  const decided = action.status !== 'pending';

  return (
    <div
      className={cn(
        'rounded-(--radius-card-sm) border p-3.5 transition-shadow duration-500',
        glass ? 'glass' : 'bg-surface',
        !glass && (decided ? 'border-line/60' : 'border-line'),
        pulsing &&
          'border-pending/70 shadow-[0_0_0_1px_rgb(230_168_72/0.45),0_0_26px_rgb(230_168_72/0.28)]',
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-muted text-label-s min-w-0 truncate font-mono uppercase">
          {action.source}
        </span>
        <Pill tone={pill.tone} className="shrink-0">
          {pill.label}
        </Pill>
      </div>
      <p
        className={cn(
          'font-sans text-[0.9375rem] leading-snug font-semibold text-balance',
          decided ? 'text-ink-soft' : 'text-ink',
        )}
      >
        {action.title}
      </p>
      <p className="text-muted mt-1 text-[0.8125rem] leading-snug">{action.preview}</p>
    </div>
  );
}
