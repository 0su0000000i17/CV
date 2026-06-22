'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Loader2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { DashboardResumeSelectionProvider } from './_components/DashboardResumeSelectionProvider';

import { useAuth } from '@/src/shared/hooks/useAuth';

const navItems = [
  {
    title: 'Обзор',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Мои резюме',
    href: '/dashboard/resumes',
    icon: FileText,
  },
  {
    title: 'Адаптация',
    href: '/dashboard/adapt',
    icon: Sparkles,
  },
  {
    title: 'Оценка резюме',
    href: '/dashboard/analyze',
    icon: BarChart3,
  },
  {
    title: 'Оплата',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    title: 'Настройки',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    return <DashboardRedirectState />;
  }

  return (
    <DashboardResumeSelectionProvider>
      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:flex lg:flex-col">
          <div className="fixed bottom-30 top-24 flex w-[280px] flex-col overflow-y-auto rounded-2xl border border-border bg-card/60 p-4">
            <div className="px-3 pb-6 pt-2">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                CV Pro
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Личный кабинет
              </p>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active
                          ? 'text-background'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />

                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">
                Тариф:{' '}
                <span className="font-semibold uppercase tracking-wide text-emerald-500">
                  Free
                </span>
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                Адаптации в этом месяце
              </p>

              <div className="mt-3 flex items-end gap-1">
                <span className="text-2xl font-semibold text-foreground">
                  0
                </span>

                <span className="pb-1 text-sm text-muted-foreground">
                  / 10
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-muted">
                <div className="h-2 w-0 rounded-full bg-foreground" />
              </div>

              <Link
                href="/dashboard/billing"
                className="mt-4 block text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Улучшить тариф →
              </Link>
            </div>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </DashboardResumeSelectionProvider>
  );
}

function DashboardLoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Проверяем сессию...
      </div>
    </div>
  );
}

function DashboardRedirectState() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        Перенаправляем на страницу входа...
      </div>
    </div>
  );
}