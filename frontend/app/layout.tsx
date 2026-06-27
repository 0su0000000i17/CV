import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { Header } from '@/src/widgets';
import { ThemeFavicon } from './theme-favicon';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CV Pro',
  description: 'AI-сервис для анализа и адаптации резюме',
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

            <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-16 md:px-12 md:py-24">
              {children}
            </main>

            <footer className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
              <div className="border-t border-border pb-8 pt-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm leading-6 text-muted-foreground">
                    <p>© 2026 CVPro. Все права защищены.</p>
                    <a
                      href="mailto:support@cvpro.ru"
                      className="transition-colors hover:text-foreground"
                    >
                      support@cvpro.ru
                    </a>
                  </div>

                  <nav className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
                    <Link
                      href="/privacy"
                      className="transition-colors hover:text-foreground"
                    >
                      Политика конфиденциальности
                    </Link>
                    <Link
                      href="/terms"
                      className="transition-colors hover:text-foreground"
                    >
                      Условия использования
                    </Link>
                  </nav>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
