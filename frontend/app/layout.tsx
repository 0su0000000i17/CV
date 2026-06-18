import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Импортируем стили. Убедись, что globals.css лежит в той же папке app/
import "./globals.css"; 

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
    // Принудительно добавляем класс dark и фоновые цвета на уровне HTML
    <html lang="ru" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.variable} bg-black text-white min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}