import { approveMoment } from '@/content/site';
import { cn } from '../ui/cn';
import { ChevronLeftIcon } from '../ui/icons';
import { Pill } from '../ui/Pill';

const d = approveMoment.detail;

interface DetailScreenProps {
  className?: string;
  /** Highlights the editable subject field (driven by scroll). */
  subjectGlow?: boolean;
  /** Shows the tap ring over the Approve button. */
  tapRing?: boolean;
}

/** The action-detail screen shown in the "approve moment" phone. */
export function DetailScreen({ className, subjectGlow = true, tapRing = true }: DetailScreenProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <header className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted text-label-s flex items-center gap-1 font-mono uppercase">
            <ChevronLeftIcon className="size-3.5" />
            {d.back}
          </span>
          <Pill tone="pending">PENDING</Pill>
        </div>
        <p className="text-ink font-display mt-2.5 text-[1.0625rem] leading-snug font-bold tracking-tight">
          {d.title}
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden px-4">
        <div className="bg-accent-wash border-accent/30 rounded-(--radius-card-sm) border p-3">
          <p className="text-accent-bright text-label-s font-mono uppercase">{d.intentLabel}</p>
          <p className="text-accent-ink mt-1.5 text-[0.8125rem] leading-snug">{d.intent}</p>
        </div>

        <div className="bg-surface border-line space-y-2.5 rounded-(--radius-card-sm) border p-3">
          <p className="text-muted text-label-s font-mono uppercase">
            {d.toLabel} <span className="text-ink-soft normal-case">{d.to}</span>
          </p>

          <div
            className={cn(
              'rounded-[10px] border p-2.5 transition-shadow duration-500',
              subjectGlow
                ? 'border-accent shadow-[0_0_0_1px_rgb(30_166_198/0.45),0_0_24px_rgb(30_166_198/0.3)]'
                : 'border-line',
            )}
          >
            <p className="text-accent-bright text-label-s font-mono uppercase">{d.subjectLabel}</p>
            <p className="text-ink mt-1 text-[0.8125rem] leading-snug font-semibold">{d.subject}</p>
          </div>

          <p className="text-ink-soft text-[0.75rem] leading-relaxed">{d.body}</p>
        </div>
      </div>

      <div className="border-line bg-bg/70 flex items-center gap-2 border-t p-3">
        <span className="border-stop/70 text-stop flex h-10 items-center rounded-[10px] border px-3 text-[0.8125rem] font-semibold">
          {d.reject}
        </span>
        <span className="bg-surface border-line-strong text-ink flex h-10 items-center rounded-[10px] border px-3 text-[0.8125rem] font-semibold">
          {d.edit}
        </span>
        <span className="relative flex flex-1">
          <span className="bg-go flex h-10 w-full items-center justify-center rounded-[10px] text-[0.8125rem] font-semibold text-[#06210F] shadow-(--shadow-glow-go)">
            {d.approve}
          </span>
          {tapRing ? (
            <span
              aria-hidden="true"
              className="border-go/70 pointer-events-none absolute top-1/2 right-5 size-9 -translate-y-1/2 rounded-full border-2"
            />
          ) : null}
        </span>
      </div>
    </div>
  );
}
