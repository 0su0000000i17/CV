'use client';

import Link from 'next/link';
import { Logo } from '@/src/shared/ui/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { CircleUserRound, LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { useProfileQuery } from '@/src/shared/hooks/useProfileQuery';
import { supabase } from '@/src/shared/lib/supabase/client';

export function Header() {
  const { user, accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login';
  const isDashboard = pathname.startsWith('/dashboard');

  const profile = profileQuery.data?.profile;
  const email = profile?.email || user?.email || '';
  const fullName = profile?.full_name || email.split('@')[0] || 'Пользователь';

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((currentValue) => !currentValue);
  };

  const handleNavigate = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="inline-flex items-center" aria-label="CVPro">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <HeaderNavLinks
            isDashboard={isDashboard}
            showDashboard={!loading && Boolean(user)}
          />
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggleButton
            mounted={mounted}
            resolvedTheme={resolvedTheme}
            onToggle={handleToggleTheme}
          />

          <div className="hidden min-w-[76px] md:block">
            <DesktopAuthControl
              isLoginPage={isLoginPage}
              loading={loading}
              authenticated={Boolean(user)}
              fullName={fullName}
              email={email}
              profileLoading={profileQuery.isLoading}
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
        authenticated={Boolean(user)}
        fullName={fullName}
        email={email}
        onNavigate={handleNavigate}
      />
    </header>
  );
}

function HeaderNavLinks({
  isDashboard,
  showDashboard,
  onNavigate,
}: {
  isDashboard: boolean;
  showDashboard: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link
        href="/about"
        onClick={onNavigate}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        О проекте
      </Link>

      <Link
        href="/how-it-works"
        onClick={onNavigate}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Как это работает
      </Link>

      <Link
        href="/contacts"
        onClick={onNavigate}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Контакты
      </Link>

      {showDashboard ? (
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`transition-colors ${
            isDashboard
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Личный кабинет
        </Link>
      ) : null}
    </>
  );
}

function ThemeToggleButton({
  mounted,
  resolvedTheme,
  onToggle,
}: {
  mounted: boolean;
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
      {mounted ? (
        resolvedTheme === 'dark' ? (
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

function DesktopAuthControl({
  isLoginPage,
  loading,
  authenticated,
  fullName,
  email,
  profileLoading,
}: {
  isLoginPage: boolean;
  loading: boolean;
  authenticated: boolean;
  fullName: string;
  email: string;
  profileLoading: boolean;
}) {
  if (isLoginPage) {
    return <div className="h-[38px] w-full" />;
  }

  if (loading) {
    return (
      <div className="ml-auto h-[38px] w-[76px] animate-pulse rounded-lg bg-muted" />
    );
  }

  if (!authenticated) {
    return (
      <Link
        href="/login"
        className="ml-auto inline-block rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex justify-end">
      <ProfilePopover
        fullName={fullName}
        email={email}
        loading={profileLoading}
      />
    </div>
  );
}

function ProfilePopover({
  fullName,
  email,
  loading,
}: {
  fullName: string;
  email: string;
  loading: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);

    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      console.error(error);
      return;
    }

    queryClient.clear();
    router.replace('/');
    router.refresh();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-muted-foreground"
        aria-label="Открыть профиль"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <CircleUserRound className="h-7 w-7" strokeWidth={1.7} />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-[70] mt-2 w-60 rounded-2xl border border-border bg-background p-4 shadow-2xl"
        >
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              <p className="truncate font-medium text-foreground">{fullName}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {email}
              </p>
            </>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Текущий тариф</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Free
            </span>
          </div>

          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="mt-3 block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Настройки профиля
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      ) : null}
    </div>
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
      aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
      aria-expanded={isOpen}
    >
      <span
        className={`block h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-y-2 rotate-45' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ease-in-out ${
          isOpen ? '-translate-y-2 -rotate-45' : ''
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
  authenticated,
  fullName,
  email,
  onNavigate,
}: {
  isOpen: boolean;
  isDashboard: boolean;
  showDashboard: boolean;
  isLoginPage: boolean;
  loading: boolean;
  authenticated: boolean;
  fullName: string;
  email: string;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    onNavigate();

    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      console.error(error);
      return;
    }

    queryClient.clear();
    router.replace('/');
    router.refresh();
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? 'max-h-[620px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="border-t border-border bg-background/95 px-4 py-6 backdrop-blur">
        <nav className="flex flex-col items-center gap-4 text-sm font-medium">
          <HeaderNavLinks
            isDashboard={isDashboard}
            showDashboard={showDashboard}
            onNavigate={onNavigate}
          />

          {!isLoginPage && !loading ? (
            authenticated ? (
              <div className="mt-2 w-full max-w-sm rounded-2xl border border-border bg-background p-4">
                <p className="truncate font-medium text-foreground">
                  {fullName}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {email}
                </p>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2.5 text-xs">
                  <span className="text-muted-foreground">Тариф</span>
                  <span className="font-semibold uppercase text-emerald-500">
                    Free
                  </span>
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={onNavigate}
                  className="mt-4 block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Настройки профиля
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onNavigate}
                className="mt-2 w-full max-w-[200px] rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background"
              >
                Войти
              </Link>
            )
          ) : null}
        </nav>
      </div>
    </div>
  );
}
