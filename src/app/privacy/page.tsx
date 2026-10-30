import type { Metadata } from 'next';
import { brand, NOINDEX } from '@/content/site';
import { privacy } from '@/content/legal';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: `${privacy.title} — ${brand.name}`,
  description: privacy.description,
  alternates: NOINDEX ? undefined : { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalPage doc={privacy} />;
}
