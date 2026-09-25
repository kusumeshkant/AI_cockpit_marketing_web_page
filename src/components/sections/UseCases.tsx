import { useCases } from '@/content/site';
import { ActionCard } from '../mock/ActionCard';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';
import { TiltCard } from './TiltCard';

/** Four places where an unsupervised agent would be expensive. */
export function UseCases() {
  return (
    <Section id="use-cases" tone="paper">
      <Container>
        <SectionHeader eyebrow={useCases.eyebrow} heading={useCases.heading} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.items.map((item) => (
            <li key={item.id} className="stage-3d min-w-0">
              <TiltCard>
                <div className="relative">
                  <p className="text-muted text-label-s mb-3 font-mono uppercase">
                    {useCases.waitingLabel}
                  </p>
                  {/* Illustration of the app; the heading and body carry the message. */}
                  <div aria-hidden="true">
                    <ActionCard action={item.action} className="bg-bg" />
                  </div>
                  <h3 className="text-h4 text-ink mt-5">{item.title}</h3>
                  <p className="text-body text-ink-soft mt-2">{item.body}</p>
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
