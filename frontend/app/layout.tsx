import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/src/widgets";

export const metadata: Metadata = {
  title: "CV Prophet",
  description: "AI-сервис для анализа и адаптации резюме",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-black text-white">
        <Header />
        {children}
      </body>
    </html>
  );
}