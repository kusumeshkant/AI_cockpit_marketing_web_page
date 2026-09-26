import { finalCta } from '@/content/site';
import { RequestDemoButton } from '../inquiry/RequestDemoButton';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';

/** Closing call to action, centred over slowly counter-rotating HUD rings. */
export function FinalCta() {
  return (
    <Section className="overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="radial-glow absolute size-[620px] rounded-full" />
        <div className="border-accent/25 absolute size-[420px] rounded-full border motion-safe:animate-[spin-slow_48s_linear_infinite] sm:size-[520px]" />
        <div className="border-accent/35 absolute size-[300px] rounded-full border border-dashed motion-safe:animate-[spin-slow-reverse_36s_linear_infinite] sm:size-[380px]" />
        <div className="hud-grid absolute inset-0 opacity-60" />
      </div>

      <Container className="relative flex flex-col items-center text-center">
        <h2 className="text-h2 text-ink max-w-3xl">{finalCta.heading}</h2>
        <p className="text-body-l text-ink-soft mt-5 max-w-xl">{finalCta.sub}</p>
        <RequestDemoButton className="mt-9" />
      </Container>
    </Section>
  );
}
