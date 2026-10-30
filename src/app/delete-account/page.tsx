import type { Metadata } from 'next';
import { brand, NOINDEX } from '@/content/site';
import { accountDeletion } from '@/content/legal';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: `${accountDeletion.title} — ${brand.name}`,
  description: accountDeletion.description,
  alternates: NOINDEX ? undefined : { canonical: '/delete-account' },
  // Linked from Play Console: indexable even on noindex builds (see LEGAL_PATHS).
  robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
  return <LegalPage doc={accountDeletion} />;
}
