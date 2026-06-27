'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Loader2,
  Mail,
  Settings,
  Sparkles,
} from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { DashboardResumeSelectionProvider } from './_components/dashboard-resume-selection-provider';

import { useAuth } from '@/src/shared/hooks/use-auth';

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
    title: 'Адаптировать под вакансию',
    href: '/dashboard/adapt',
    icon: Sparkles,
  },
  {
    title: 'Сопроводительное письмо',
    href: '/dashboard/cover-letter',
    icon: Mail,
  },
  {
    title: 'Оценить резюме',
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
      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
        <aside className="hidden min-w-0 lg:block">
          <div className="sticky top-20 flex max-h-[calc(100svh-6.5rem)] min-h-0 flex-col overflow-y-auto rounded-2xl border border-border bg-card/60 p-4 lg:w-[240px] xl:w-[280px] xl:p-5">
            <div className="px-3 pb-5 pt-2 xl:pb-6">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                CV<span className="text-emerald-500">Pro</span>
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Личный кабинет
              </p>
            </div>

            <nav className="flex min-h-0 flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors xl:py-3 ${
                      active
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active
                          ? 'text-background'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />

                    <span className="min-w-0 break-words leading-5">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl border border-border bg-background p-3.5 xl:mt-auto">
              <p className="text-sm font-medium text-foreground">
                Тариф:{' '}
                <span className="font-semibold uppercase tracking-wide text-emerald-500">
                  Free
                </span>
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Бесплатные генерации
                </p>

                <p className="whitespace-nowrap text-sm font-semibold text-foreground">
                  0<span className="text-muted-foreground"> / 5</span>
                </p>
              </div>

              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 w-0 rounded-full bg-foreground" />
              </div>

              <Link
                href="/dashboard/billing"
                className="mt-3 block text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Улучшить тариф →
              </Link>
            </div>
          </div>
        </aside>

        <section className="min-w-0 pb-8">{children}</section>
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
