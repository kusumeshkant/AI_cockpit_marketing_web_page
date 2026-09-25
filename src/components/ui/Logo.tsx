import { brand } from '@/content/site';
import { cn } from './cn';
import { HudMark } from './icons';

interface LogoProps {
  className?: string;
  /** Renders the mark only — used inside the phone's app-icon tile. */
  markOnly?: boolean;
}

/** HUD mark plus the wordmark. */
export function Logo({ className, markOnly }: LogoProps) {
  if (markOnly) {
    return <HudMark className={cn('text-accent-bright size-6', className)} />;
  }
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <HudMark className="text-accent-bright size-7 shrink-0" />
      <span className="text-ink font-display text-[1.0625rem] font-bold tracking-tight">
        {brand.name}
      </span>
    </span>
  );
}
