'use client';

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          CV
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            О проекте
          </Link>
          <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            Как это работает
          </Link>
          <Link href="/contacts" className="text-muted-foreground hover:text-foreground transition-colors">
            Контакты
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Переключить тему"
          >
            {isMounted ? (
              resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )
            ) : (
              <div className="h-5 w-5 text-foreground" />
            )}
          </button>

          <Link
            href="/login"
            className="hidden md:inline-block px-4 py-2 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-foreground/80 transition-colors"
          >
            Войти
          </Link>

          {/* Анимированный бургер */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 group"
            aria-label="Открыть меню"
          >
            <span
              className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 ease-in-out ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Мобильное меню с анимацией выкатывания */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border bg-background/95 backdrop-blur px-4 py-6">
          <nav className="flex flex-col items-center gap-4 text-sm font-medium">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              О проекте
            </Link>
            <Link
              href="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Как это работает
            </Link>
            <Link
              href="/contacts"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Контакты
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-foreground/80 transition-colors w-full max-w-[200px] text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Войти
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
