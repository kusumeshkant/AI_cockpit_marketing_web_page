import type { Metadata } from 'next';
import { brand, NOINDEX } from '@/content/site';
import { privacy } from '@/content/legal';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: `${privacy.title} — ${brand.name}`,
  description: privacy.description,
  alternates: NOINDEX ? undefined : { canonical: '/privacy' },
  // Linked from Play Console: indexable even on noindex builds (see LEGAL_PATHS).
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <LegalPage doc={privacy} />;
}
