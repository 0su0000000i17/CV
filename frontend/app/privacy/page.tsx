import type { Metadata } from 'next';

import { LegalPage } from '@/src/shared/ui/legal-page';

import { privacySections } from './privacy-sections';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Как Сервис обрабатывает и защищает данные пользователей.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Политика конфиденциальности"
      description="Настоящая Политика описывает, какие данные обрабатывает Сервис, с какой целью и как пользователь может ими управлять."
      updatedAt="12 июля 2026"
      sections={privacySections}
    />
  );
}
