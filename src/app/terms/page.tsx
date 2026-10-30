import type { Metadata } from 'next';
import { brand, NOINDEX } from '@/content/site';
import { terms } from '@/content/legal';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: `${terms.title} — ${brand.name}`,
  description: terms.description,
  alternates: NOINDEX ? undefined : { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalPage doc={terms} />;
}
