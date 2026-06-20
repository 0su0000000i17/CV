"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/src/shared/lib/supabase/client";
import { useAuth } from "@/src/shared/hooks/useAuth";

const isDevAuth = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const { theme, setTheme, resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((currentValue) => !currentValue);
  };

  async function handleLogout() {
    if (isDevAuth) {
      setIsMenuOpen(false);
      return;
    }

    await supabase.auth.signOut();

    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-xl font-bold text-foreground">
          CV
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <HeaderNavLinks isDashboard={isDashboard} showDashboard={!loading && Boolean(user)} />
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggleButton
            isMounted={isMounted}
            resolvedTheme={resolvedTheme}
            onToggle={handleToggleTheme}
          />

          <div className="hidden min-w-[76px] md:block">
            <AuthButton
              isLoginPage={isLoginPage}
              loading={loading}
              user={user}
              onLogout={handleLogout}
            />
          </div>

          <MobileMenuButton isOpen={isMenuOpen} onClick={handleToggleMenu} />
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        isDashboard={isDashboard}
        showDashboard={!loading && Boolean(user)}
        isLoginPage={isLoginPage}
        loading={loading}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}

function HeaderNavLinks({
  isDashboard,
  showDashboard,
}: {
  isDashboard: boolean;
  showDashboard: boolean;
}) {
  return (
    <>
      <Link
        href="/about"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        О проекте
      </Link>

      <Link
        href="/how-it-works"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Как это работает
      </Link>

      <Link
        href="/contacts"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Контакты
      </Link>

      {showDashboard ? (
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
      ) : null}
    </>
  );
}

function ThemeToggleButton({
  isMounted,
  resolvedTheme,
  onToggle,
}: {
  isMounted: boolean;
  resolvedTheme?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
  );
}

function AuthButton({
  isLoginPage,
  loading,
  user,
  onLogout,
}: {
  isLoginPage: boolean;
  loading: boolean;
  user: unknown;
  onLogout: () => void;
}) {
  if (isLoginPage) {
    return <div className="h-[38px] w-full" />;
  }

  if (loading) {
    return <div className="h-[38px] w-full animate-pulse rounded-lg bg-muted" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-block w-full rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Войти
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      className="inline-block w-full rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
    >
      Выйти
    </button>
  );
}

function MobileMenuButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
      aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
      aria-expanded={isOpen}
    >
      <span
        className={`block h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ease-in-out ${
          isOpen ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ease-in-out ${
          isOpen ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </button>
  );
}

function MobileMenu({
  isOpen,
  isDashboard,
  showDashboard,
  isLoginPage,
  loading,
  user,
  onLogout,
}: {
  isOpen: boolean;
  isDashboard: boolean;
  showDashboard: boolean;
  isLoginPage: boolean;
  loading: boolean;
  user: unknown;
  onLogout: () => void;
}) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="border-t border-border bg-background/95 px-4 py-6 backdrop-blur">
        <nav className="flex flex-col items-center gap-4 text-sm font-medium">
          <HeaderNavLinks isDashboard={isDashboard} showDashboard={showDashboard} />

          <div className="w-full max-w-[200px]">
            <AuthButton
              isLoginPage={isLoginPage}
              loading={loading}
              user={user}
              onLogout={onLogout}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}