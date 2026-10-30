import type { Metadata } from 'next';
import { brand, NOINDEX } from '@/content/site';
import { accountDeletion } from '@/content/legal';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: `${accountDeletion.title} — ${brand.name}`,
  description: accountDeletion.description,
  alternates: NOINDEX ? undefined : { canonical: '/delete-account' },
};

export default function DeleteAccountPage() {
  return <LegalPage doc={accountDeletion} />;
}
