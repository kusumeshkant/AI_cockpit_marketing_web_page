import type { CSSProperties } from 'react';
import { security } from '@/content/site';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

/**
 * A check mark that draws its own stroke as the card scrolls into view. Driven
 * by a CSS view timeline rather than an observer, so this section never
 * hydrates; under reduced motion the stroke is simply already drawn.
 */
function DrawnCheck({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-5"
    >
      <path
        d="m4.5 12.5 5 5 10-11"
        pathLength={1}
        strokeDasharray={1}
        style={
          {
            '--reveal-delay': `${index * 0.08}s`,
            '--reveal-offset': `${index * 4}%`,
          } as CSSProperties
        }
        className="reveal-draw [stroke-dashoffset:0]"
      />
    </svg>
  );
}

/** Six trust guarantees, one per backend requirement. */
export function Security() {
  return (
    <Section id="security" tone="paper">
      <Container>
        <SectionHeader eyebrow={security.eyebrow} heading={security.heading} sub={security.sub} />

        <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {security.items.map((item, i) => (
            <li
              key={item.id}
              className="bg-surface border-line flex gap-4 rounded-(--radius-card) border p-5 sm:flex-col sm:p-6"
            >
              <span className="bg-go-bg text-go flex size-10 shrink-0 items-center justify-center rounded-(--radius-card-sm)">
                <DrawnCheck index={i} />
              </span>
              <div>
                <h3 className="text-h4 text-ink">{item.title}</h3>
                <p className="text-body text-ink-soft mt-2">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
