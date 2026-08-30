import type { Metadata } from 'next';

import { LegalPage } from '@/src/shared/ui/legal-page';

import { termsSections } from './terms-sections';

export const metadata: Metadata = {
  title: 'Условия использования',
  description: 'Правила использования Сервиса.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Условия использования"
      description="Настоящие Условия регулируют использование Сервиса, расположенного на домене cvmatch.ru. Правила оплаты, тарифов и возвратов вынесены в отдельный документ — Оферту."
      updatedAt="12 июля 2026"
      sections={termsSections}
    />
  );
}
