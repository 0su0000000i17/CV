import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { Footer, Header } from '@/src/widgets';
import { ThemeFavicon } from './theme-favicon';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CV Pro',
  description: 'AI-сервис для анализа и адаптации резюме',
};

const rawMobileDebugScript = `
(function () {
  window.__cvproRawDebugCount = 0;

  function createButton() {
    if (document.getElementById('cvpro-raw-debug-button')) {
      return;
    }

    var button = document.createElement('button');
    button.id = 'cvpro-raw-debug-button';
    button.type = 'button';
    button.textContent = 'RAW JS TEST 0';
    button.style.position = 'fixed';
    button.style.right = '16px';
    button.style.bottom = '16px';
    button.style.zIndex = '2147483647';
    button.style.padding = '12px 16px';
    button.style.borderRadius = '999px';
    button.style.border = '2px solid #22c55e';
    button.style.background = '#16a34a';
    button.style.color = '#ffffff';
    button.style.font = '700 12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

    button.addEventListener('click', function () {
      window.__cvproRawDebugCount = window.__cvproRawDebugCount + 1;
      button.textContent = 'RAW JS TEST ' + window.__cvproRawDebugCount;
      window.alert('CVPro raw JS click ' + window.__cvproRawDebugCount);
    });

    document.body.appendChild(button);
    window.alert('CVPro raw JS mounted');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
`;

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
        <script dangerouslySetInnerHTML={{ __html: rawMobileDebugScript }} />
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
