"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { supabase } from "@/src/shared/lib/supabase/client";
import { useAuth } from "@/src/shared/hooks/useAuth";

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-xl font-bold text-foreground">
          CV
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            О проекте
          </Link>

          <Link
            href="/contacts"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Контакты
          </Link>

          {!loading && user && (
            <Link
              href="/dashboard"
              className={`transition-colors ${
                isDashboard
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Личный кабинет
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Переключить тему"
          >
            {isMounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>

          {!loading && !user && !isLoginPage && (
            <Link
              href="/login"
              className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 md:inline-block"
            >
              Войти
            </Link>
          )}

          {!loading && user && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 md:inline-block"
            >
              Выйти
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
            aria-label="Открыть меню"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-6 backdrop-blur md:hidden">
          <nav className="flex flex-col items-center gap-4 text-sm font-medium">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              О проекте
            </Link>

            <Link
              href="/contacts"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Контакты
            </Link>

            {!loading && user && (
              <Link
                href="/dashboard"
                className={`transition-colors ${
                  isDashboard
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Личный кабинет
              </Link>
            )}

            {!loading && !user && !isLoginPage && (
              <Link
                href="/login"
                className="w-full max-w-[200px] rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                Войти
              </Link>
            )}

            {!loading && user && (
              <button
                type="button"
                className="w-full max-w-[200px] rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                onClick={handleLogout}
              >
                Выйти
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}