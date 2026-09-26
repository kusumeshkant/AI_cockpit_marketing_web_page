import { nav } from '@/content/site';
import { DemoModalHost } from '@/components/inquiry/DemoModalHost';
import { ApproveMoment } from '@/components/sections/ApproveMoment';
import { Consultants } from '@/components/sections/Consultants';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Nav } from '@/components/sections/Nav';
import { Platforms } from '@/components/sections/Platforms';
import { Pricing } from '@/components/sections/Pricing';
import { Problem } from '@/components/sections/Problem';
import { RequestDemo } from '@/components/sections/RequestDemo';
import { Security } from '@/components/sections/Security';
import { StickyCta } from '@/components/sections/StickyCta';
import { UseCases } from '@/components/sections/UseCases';

export default function Page() {
  return (
    <>
      <a
        href="#main"
        className="bg-accent text-bg sr-only rounded-(--radius-btn) px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]"
      >
        {nav.skipToContent}
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Platforms />
        <Problem />
        <HowItWorks />
        <ApproveMoment />
        <UseCases />
        <Consultants />
        <Security />
        <Pricing />
        <Faq />
        <RequestDemo />
        <FinalCta />
      </main>

      <Footer />
      <StickyCta />
      <DemoModalHost />
    </>
  );
}
