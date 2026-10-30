import Link from 'next/link';
import { brand } from '@/content/site';
import type { LegalDoc } from '@/content/legal';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';

/** Shared layout for /privacy, /terms and /delete-account. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const showPartHeadings = doc.parts.length > 1;

  return (
    <main className="py-(--spacing-section)">
      <Container className="max-w-3xl">
        <Link href="/" className="mb-10 inline-block" aria-label={`${brand.name} — home`}>
          <Logo />
        </Link>

        <h1 className="text-h2 text-ink">{doc.title}</h1>
        <p className="text-muted text-body-s mt-3">{doc.updated}</p>
        {doc.intro.map((paragraph) => (
          <p key={paragraph} className="text-body-l text-ink-soft mt-6">
            {paragraph}
          </p>
        ))}

        {doc.parts.map((part) => (
          <div key={part.id} id={part.id} className="mt-14">
            {showPartHeadings && (
              <h2 className="text-h3 text-ink border-line border-b pb-4">{part.heading}</h2>
            )}
            <div className="mt-10 flex flex-col gap-10">
              {part.sections.map((section) => {
                const Heading = showPartHeadings ? 'h3' : 'h2';
                return (
                  <section key={section.id} id={section.id}>
                    <Heading className="text-h4 text-ink">{section.heading}</Heading>
                    {section.body?.map((paragraph) => (
                      <p key={paragraph} className="text-body text-ink-soft mt-3">
                        {paragraph}
                      </p>
                    ))}
                    {section.items && (
                      <ul className="text-body text-ink-soft mt-3 list-disc space-y-2 pl-6">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {section.note && <p className="text-body text-ink-soft mt-3">{section.note}</p>}
                  </section>
                );
              })}
            </div>
          </div>
        ))}

        <p className="border-line text-body-s text-muted mt-14 border-t pt-8">{brand.copyright}</p>
      </Container>
    </main>
  );
}
