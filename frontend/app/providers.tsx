"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { QueryProvider } from "@/src/shared/providers/QueryProvider";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange={false}
      >
        {children}
      </NextThemesProvider>
    </QueryProvider>
  );
}