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
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <span>v1.0.0</span>
                  <span>© 2026 CV PRO</span>
                </div>

                <nav className="mt-6 grid w-full grid-cols-1 gap-y-3 text-sm font-medium text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                  {legalLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block whitespace-nowrap transition-colors hover:text-foreground ${
                        index === 0
                          ? 'text-left'
                          : index === legalLinks.length - 1
                            ? 'lg:text-right'
                            : 'lg:text-center'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
