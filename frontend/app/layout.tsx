import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { Footer, Header } from '@/src/widgets';
import { ThemeFavicon } from './theme-favicon';

const siteUrl = 'https://cvpro.example';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'CVPro',
  title: {
    default: 'CVPro — AI-сервис для анализа и адаптации резюме',
    template: '%s | CVPro',
  },
  description:
    'CVPro помогает оценивать резюме, находить слабые места, адаптировать опыт под вакансии и готовить сильные отклики с помощью AI.',
  keywords: [
    'CVPro',
    'анализ резюме',
    'адаптация резюме',
    'AI резюме',
    'ATS проверка резюме',
    'сопроводительное письмо',
    'поиск работы',
  ],
  authors: [{ name: 'CVPro' }],
  creator: 'CVPro',
  publisher: 'CVPro',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName: 'CVPro',
    title: 'CVPro — AI-сервис для анализа и адаптации резюме',
    description:
      'Оценивай резюме, адаптируй опыт под вакансии и создавай сильные отклики с помощью AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CVPro — AI-сервис для резюме',
    description:
      'AI-сервис для анализа, адаптации резюме и подготовки сильных откликов.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-dark.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <ThemeFavicon />
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:px-10 lg:py-16 xl:px-12 xl:py-20 2xl:py-24">
              {children}
            </main>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
