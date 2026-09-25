import { hero } from '@/content/site';
import { cn } from '../ui/cn';
import { ActionCard } from './ActionCard';

interface FeedScreenProps {
  /** Id of the action that should show the amber "signal landed" pulse. */
  pulsingId?: string | null;
  className?: string;
}

/** The Actions feed screen shown inside the hero phone. */
export function FeedScreen({ pulsingId, className }: FeedScreenProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <header className="flex items-baseline justify-between px-4 pt-3 pb-3">
        <p className="text-ink font-display text-lg font-bold tracking-tight">{hero.feedTitle}</p>
        <span className="text-pending text-label-s font-mono uppercase">{hero.feedCountLabel}</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-4 pb-3">
        {hero.actions.map((action) => (
          <ActionCard key={action.id} action={action} pulsing={pulsingId === action.id} />
        ))}
      </div>

      <nav
        aria-hidden="true"
        className="border-line bg-bg/80 flex items-center justify-around border-t px-2 py-2.5"
      >
        {hero.bottomNav.map((item, i) => (
          <span
            key={item}
            className={cn(
              'text-label-s font-mono uppercase',
              i === 0 ? 'text-accent-bright' : 'text-muted',
            )}
          >
            {item}
          </span>
        ))}
      </nav>
    </div>
  );
}
