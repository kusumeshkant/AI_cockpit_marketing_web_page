import type { CSSProperties } from 'react';
import { consultants, cta, DEMO_URL } from '@/content/site';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { CheckIcon } from '../ui/icons';
import { Section } from '../ui/Section';

/**
 * The reseller pitch, wrapped in a glowing accent panel. Fully static: the
 * breathing glow is a CSS keyframe and the chat bubbles reveal on a CSS view
 * timeline as the panel scrolls in, so nothing here hydrates.
 */
export function Consultants() {
  return (
    <Section id="consultants">
      <Container>
        <div className="relative">
          <div
            aria-hidden="true"
            className="radial-glow pointer-events-none absolute inset-x-0 -inset-y-10 rounded-full opacity-60 blur-3xl motion-safe:animate-[glow-breathe_4s_ease-in-out_infinite]"
          />

          <div className="border-accent/50 from-accent-wash to-surface relative rounded-(--radius-panel) border bg-gradient-to-br shadow-[var(--shadow-deep),var(--shadow-glow)]">
            <div className="grid gap-12 p-7 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
              <div>
                <Eyebrow>{consultants.eyebrow}</Eyebrow>
                <h2 className="text-h2-sub text-ink mt-4">{consultants.heading}</h2>

                <ul className="mt-8 flex flex-col gap-4">
                  {consultants.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="bg-go-bg text-go mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                        <CheckIcon className="size-3.5" />
                      </span>
                      <span className="text-body text-ink-soft">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <Button href={DEMO_URL} className="w-full sm:w-auto" data-cta="book-demo">
                    {cta.primary}
                  </Button>
                  <Button href="#pricing" variant="ghost">
                    {cta.consultantPlan}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4">
                {consultants.chat.map((bubble, i) => (
                  <div
                    key={bubble.id}
                    style={
                      {
                        '--reveal-delay': `${i * 0.35}s`,
                        '--reveal-offset': `${i * 10}%`,
                      } as CSSProperties
                    }
                    className={cn(
                      'reveal max-w-[85%]',
                      bubble.side === 'right' ? 'self-end text-right' : 'self-start',
                    )}
                  >
                    <p
                      className={cn(
                        'text-label-s mb-1.5 font-mono uppercase',
                        bubble.side === 'right' ? 'text-accent-bright' : 'text-muted',
                      )}
                    >
                      {bubble.from}
                    </p>
                    <p
                      className={cn(
                        'text-body rounded-(--radius-card-md) px-4 py-3 text-left',
                        bubble.side === 'right'
                          ? 'bg-accent text-bg font-semibold'
                          : 'bg-surface border-line text-ink-soft border',
                      )}
                    >
                      {bubble.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
