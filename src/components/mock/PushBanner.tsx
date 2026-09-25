import { hero } from '@/content/site';
import { cn } from '../ui/cn';
import { Logo } from '../ui/Logo';

/**
 * The iOS/Android-style push notification that drops over the phone when an
 * agent signal arrives.
 */
export function PushBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-(--radius-card-md) border p-3',
        'border-line-strong bg-surface-alt/92 shadow-[var(--shadow-deep),0_0_40px_rgb(63_194_223/0.22)] backdrop-blur-xl',
        className,
      )}
    >
      <span className="bg-bg border-line-strong flex size-9 shrink-0 items-center justify-center rounded-[10px] border">
        <Logo markOnly className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-accent-bright text-label-s font-mono uppercase">{hero.push.app}</p>
        <p className="text-ink mt-1 text-[0.8125rem] leading-snug font-semibold">
          {hero.push.title}
        </p>
        <p className="text-ink-soft truncate text-[0.75rem] leading-snug">{hero.push.subtitle}</p>
      </div>
    </div>
  );
}
