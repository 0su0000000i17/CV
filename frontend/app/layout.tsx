import { Inter } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';

import { QueryProvider } from '@/src/shared/providers/query-provider';
import { ThemeProvider } from '@/src/shared/providers/theme-provider';
import { PublicRouteTransition } from '@/src/shared/ui/public-route-transition';
import { UtmCapture } from '@/src/shared/ui/utm-capture';
import { Footer, Header } from '@/src/widgets';

import { SiteAnalytics } from './_components/site-analytics';
import { siteMetadata } from './_lib/site-metadata';
import { themeBootScript } from './_lib/theme-boot-script';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });
export const metadata = siteMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-dark.svg?v=3" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <SiteAnalytics />
      </head>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            <UtmCapture />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
              <Header />
              <main
                data-route-surface
                className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:px-10 lg:py-16 xl:px-12 xl:py-20 2xl:py-24"
              >
                <PublicRouteTransition>{children}</PublicRouteTransition>
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
