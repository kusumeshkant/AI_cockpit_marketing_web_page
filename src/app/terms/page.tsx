import type { Metadata } from 'next';
import { brand, NOINDEX } from '@/content/site';
import { terms } from '@/content/legal';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: `${terms.title} — ${brand.name}`,
  description: terms.description,
  alternates: NOINDEX ? undefined : { canonical: '/terms' },
  // Linked from Play Console: indexable even on noindex builds (see LEGAL_PATHS).
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return <LegalPage doc={terms} />;
}
