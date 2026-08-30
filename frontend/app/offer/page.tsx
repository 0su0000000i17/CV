import type { Metadata } from 'next';

import { LegalPage } from '@/src/shared/ui/legal-page';

import { offerSections } from './offer-sections';

export const metadata: Metadata = {
  title: 'Публичная оферта',
  description: 'Условия оплаты и предоставления платных функций Сервиса.',
};

export default function OfferPage() {
  return (
    <LegalPage
      title="Публичная оферта"
      description="Договор оказания услуг по предоставлению доступа к платным функциям Сервиса, расположенного на домене cvmatch.ru. Является публичной офертой в соответствии со ст. 437 Гражданского кодекса РФ."
      updatedAt="12 июля 2026"
      sections={offerSections}
    />
  );
}
