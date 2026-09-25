import { faq } from '@/content/site';
import { Container } from '../ui/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { ChevronDownIcon } from '../ui/icons';
import { Section } from '../ui/Section';

/**
 * Accordion FAQ built on native `<details>` — no state, no hydration.
 * The first item is open on load; the FAQPage JSON-LD lives in the layout and
 * is generated from the same content, so the two can never drift.
 */
export function Faq() {
  return (
    <Section tone="paper">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 className="text-h2-sub text-ink mt-4">{faq.heading}</h2>
        </div>

        <ul className="border-line border-t">
          {faq.items.map((item, i) => (
            <li key={item.id} className="border-line border-b">
              <details name="faq" open={i === 0} className="group">
                <summary className="text-ink font-display flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.0625rem] font-bold tracking-tight sm:text-lg [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDownIcon className="text-accent-bright size-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="text-body text-ink-soft max-w-2xl pb-6">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
