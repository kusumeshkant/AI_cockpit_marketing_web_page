import type { Metadata } from 'next';
import Link from 'next/link';
import { brand, NOINDEX, privacy } from '@/content/site';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { Pill } from '@/components/ui/Pill';

export const metadata: Metadata = {
  title: `${privacy.title} — ${brand.name}`,
  description: 'What the AI Cockpit demo request form collects, why, and how to have it deleted.',
  alternates: NOINDEX ? undefined : { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="py-(--spacing-section)">
      <Container className="max-w-3xl">
        <Link href="/" className="mb-10 inline-block" aria-label={`${brand.name} — home`}>
          <Logo />
        </Link>

        <Pill tone="pending" dotless className="mb-6">
          {privacy.draftNotice}
        </Pill>

        <h1 className="text-h2 text-ink">{privacy.title}</h1>
        <p className="text-muted text-body-s mt-3">{privacy.updated}</p>
        <p className="text-body-l text-ink-soft mt-6">{privacy.intro}</p>

        <div className="mt-12 flex flex-col gap-10">
          {privacy.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-h3 text-ink">{section.heading}</h2>
              <p className="text-body text-ink-soft mt-3">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="border-line text-body-s text-muted mt-14 border-t pt-8">{brand.copyright}</p>
      </Container>
    </main>
  );
}
