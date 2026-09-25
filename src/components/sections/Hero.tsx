import { cta, DEMO_URL, hero } from '@/content/site';
import { WatchDemoButton } from '../WatchDemoButton';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { HeroEyebrow } from '../ui/Eyebrow';
import { HeroStage } from './HeroStage';

/**
 * The hero. A server component: the headline, sub-copy and primary CTA are
 * plain HTML that never hydrates. Only the phone stage and the "watch demo"
 * button ship JavaScript.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Back plane: HUD grid + radial glow. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hud-grid absolute inset-0" />
        <div className="radial-glow absolute top-[18%] right-[-10%] h-[680px] w-[680px] rounded-full lg:right-[2%]" />
        <div className="from-bg absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
      </div>

      <Container className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-10">
        {/* ---- Copy column: always first in the DOM, never waits on anything ---- */}
        <div className="max-w-[700px]">
          <HeroEyebrow>{hero.eyebrow}</HeroEyebrow>

          <h1 className="text-hero text-ink mt-6 [text-wrap:normal]">
            {hero.headlineLine1}
            <br />
            <span className="text-accent-bright">{hero.headlineLine2}</span>
          </h1>

          <p className="text-body-l text-ink-soft mt-6 max-w-[38rem]">{hero.sub}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={DEMO_URL} className="w-full sm:w-auto" data-cta="book-demo">
              {cta.primary}
            </Button>
            <WatchDemoButton className="w-full sm:w-auto" />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="text-muted text-label-s font-mono uppercase">{hero.trustLabel}</span>
            <ul className="flex flex-wrap items-center gap-2">
              {hero.trustChips.map((chip) => (
                <li
                  key={chip}
                  className="border-line bg-surface/50 text-ink-soft rounded-(--radius-pill) border px-3 py-1.5 text-[0.8125rem] font-semibold"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <HeroStage />
      </Container>
    </section>
  );
}
