import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Header } from "@/src/widgets";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CV Service",
  description: "Интеллектуальный сервис для создания IT-резюме",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            {/* Основной контент — растягивается */}
            <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 md:px-12 py-16 md:py-24">
              {children}
            </main>

            {/* Полоска и футер — ОБЩИЕ ДЛЯ ВСЕХ СТРАНИЦ */}
            <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
              <div className="border-t border-border pt-8 h-[72px] flex items-center">
                {/* <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Разделы сервиса
                </p> */}
              </div>

              <div className="pt-4 pb-8 flex justify-between items-center text-xs uppercase tracking-widest text-muted-foreground font-medium">
                <span>v1.0.0</span>
                <span>© 2026 CV PROHPET</span>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}