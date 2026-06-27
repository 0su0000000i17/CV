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
  { href: '/privacy', label: 'Конфиденциальность' },
  { href: '/terms', label: 'Соглашение' },
  { href: '/offer', label: 'Оферта' },
  { href: '/personal-data', label: 'Персональные данные' },
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
              <div className="border-t border-border pt-8">
                <div className="flex flex-col gap-5 pb-8 pt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <span>v1.0.0</span>
                    <span>© 2026 CV PRO</span>
                  </div>

                  <nav className="flex flex-wrap items-center gap-x-5 gap-y-3">
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
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
