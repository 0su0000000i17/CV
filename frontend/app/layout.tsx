import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { Header } from '@/src/widgets';
import { ThemeFavicon } from './ThemeFavicon';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CV Prophet',
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
                <div className="flex items-center justify-between pb-8 pt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <span>v1.0.0</span>
                  <span>© 2026 CV PROPHET</span>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
