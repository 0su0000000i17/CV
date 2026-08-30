import type { Metadata } from 'next';

const siteUrl = 'https://cvmatch.ru';

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'cvmatch.ru',
  title: {
    default: 'cvmatch.ru — ИИ-сервис для анализа и адаптации резюме',
    template: '%s | cvmatch.ru',
  },
  description:
    'Сервис помогает оценивать и улучшать резюме, адаптировать опыт под вакансии и готовить сильные отклики с помощью ИИ.',
  keywords: [
    'анализ резюме',
    'адаптация резюме',
    'ИИ резюме',
    'ATS проверка резюме',
    'сопроводительное письмо',
    'поиск работы',
  ],
  authors: [{ name: 'cvmatch.ru' }],
  creator: 'cvmatch.ru',
  publisher: 'cvmatch.ru',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName: 'cvmatch.ru',
    title: 'cvmatch.ru — ИИ-сервис для анализа и адаптации резюме',
    description:
      'Оценивайте и улучшайте резюме, адаптируйте опыт под вакансии и создавайте сильные отклики с помощью ИИ.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cvmatch.ru — ИИ-сервис для резюме',
    description: 'ИИ-сервис для оценки, улучшения, адаптации резюме и подготовки сильных откликов.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};
