import { platforms } from '@/content/site';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';

/** Two identical runs of the word list make the marquee loop seamlessly. */
function Words({ className, ariaHidden }: { className?: string; ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className={cn(
        'flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16',
        // Reduced motion turns the track into a plain wrapped list, so the row
        // must be allowed to shrink and wrap instead of running off-screen.
        'motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:gap-y-3 motion-reduce:pr-0',
        className,
      )}
    >
      {platforms.words.map((word) => (
        <li
          key={word}
          className="text-ink-soft/70 font-display text-[1.375rem] font-bold whitespace-nowrap sm:text-[1.875rem]"
        >
          {word}
        </li>
      ))}
    </ul>
  );
}

/**
 * Slow marquee of supported platforms. Reduced motion is handled entirely in
 * CSS — the duplicate run is hidden and the list wraps — so this section never
 * hydrates.
 */
export function Platforms() {
  return (
    <section className="bg-paper border-line border-y py-12">
      <Container>
        <p className="text-muted text-label-s mb-6 font-mono uppercase">{platforms.label}</p>
      </Container>

      <div className="group mask-fade-x overflow-hidden motion-reduce:overflow-visible motion-reduce:[mask-image:none]">
        <div
          className={cn(
            'flex w-max will-change-transform motion-safe:animate-[marquee-x_32s_linear_infinite]',
            'group-hover:[animation-play-state:paused]',
            'motion-reduce:w-full motion-reduce:px-(--spacing-gutter)',
          )}
        >
          <Words />
          <Words ariaHidden className="motion-reduce:hidden" />
        </div>
      </div>
    </section>
  );
}
