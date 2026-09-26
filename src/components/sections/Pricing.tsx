import { pricing } from '@/content/site';
import { RequestDemoButton } from '../inquiry/RequestDemoButton';
import { cn } from '../ui/cn';
import { Container } from '../ui/Container';
import { CheckIcon } from '../ui/icons';
import { Pill } from '../ui/Pill';
import { Section, SectionHeader } from '../ui/Section';

/**
 * Early-access plans. Static by design — only the Consultant card's border
 * shimmers. Mobile order is Consultant, Pro, Solo (§7.10).
 */
export function Pricing() {
  const mobileOrder: Record<string, string> = {
    consultant: 'order-1 lg:order-none',
    pro: 'order-2 lg:order-none',
    solo: 'order-3 lg:order-none',
  };

  return (
    <Section id="pricing">
      <Container>
        <SectionHeader
          eyebrow={pricing.eyebrow}
          heading={pricing.heading}
          sub={pricing.sub}
          align="center"
        />

        <ul className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch">
          {pricing.plans.map((plan) => (
            <li key={plan.id} className={cn('flex', mobileOrder[plan.id] ?? '')}>
              <div
                className={cn(
                  'relative flex w-full flex-col rounded-(--radius-card) border p-6 sm:p-7',
                  plan.highlighted
                    ? 'bg-accent-wash border-accent/50 shadow-[var(--shadow-deep),var(--shadow-glow)] motion-safe:animate-[border-shimmer_5s_ease-in-out_infinite]'
                    : 'bg-surface border-line',
                )}
              >
                {plan.highlighted ? (
                  <Pill tone="live" dotless className="absolute -top-3 left-6">
                    {pricing.popularLabel}
                  </Pill>
                ) : null}

                <h3 className="text-h3 text-ink">{plan.name}</h3>

                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-ink font-display text-[2.5rem] leading-none font-extrabold">
                    {plan.price}
                  </span>
                  <span className="text-muted text-body">{pricing.perMonth}</span>
                </p>

                <p className="text-body text-ink-soft mt-3">{plan.blurb}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon className="text-go mt-0.5 size-4 shrink-0" />
                      <span className="text-body-s text-ink-soft">{feature}</span>
                    </li>
                  ))}
                </ul>

                <RequestDemoButton
                  variant={plan.variant}
                  label={plan.ctaLabel}
                  className="mt-8 w-full"
                />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
