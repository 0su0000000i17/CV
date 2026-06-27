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

const legalLinks = [
  { href: '/privacy', label: 'Политика конфиденциальности' },
  { href: '/terms', label: 'Пользовательское соглашение' },
  { href: '/offer', label: 'Оферта' },
  { href: '/personal-data', label: 'Согласие на обработку данных' },
];

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
              <div className="border-t border-border py-8">
                <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">CV Pro</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      AI-сервис для анализа и адаптации IT-резюме.
                    </p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      v1.0.0 · © 2026 CV PRO
                    </p>
                  </div>

                  <div className="md:justify-self-end md:text-right">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Документы
                    </p>

                    <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap md:justify-end">
                      {legalLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
