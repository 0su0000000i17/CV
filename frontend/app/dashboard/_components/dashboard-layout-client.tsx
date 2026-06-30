'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { DashboardResumeSelectionProvider } from './dashboard-resume-selection-provider';
import { DashboardSidebar } from './dashboard-sidebar';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';

function shouldHideDashboardNavigation(pathname: string) {
  return pathname === '/dashboard/onboarding';
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const profile = profileQuery.data?.profile;
  const profileName = profile?.full_name.trim() ?? '';
  const isOnboardingPage = pathname === '/dashboard/onboarding';
  const hideNavigation = shouldHideDashboardNavigation(pathname);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  useEffect(() => {
    if (loading || !user || !accessToken || profileQuery.isLoading || !profile) return;

    if (!profileName && !isOnboardingPage) {
      router.replace('/dashboard/onboarding');
      return;
    }

    if (profileName && isOnboardingPage) {
      router.replace('/dashboard');
    }
  }, [accessToken, isOnboardingPage, loading, profile, profileName, profileQuery.isLoading, router, user]);

  if (loading || (user && accessToken && profileQuery.isLoading)) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    return <DashboardRedirectState />;
  }

  if (accessToken && profile && !profileName && !isOnboardingPage) {
    return <DashboardRedirectState message="Открываем первый шаг настройки..." />;
  }

  return (
    <DashboardResumeSelectionProvider>
      <div
        className={
          hideNavigation
            ? 'min-h-[calc(100vh-64px)]'
            : 'grid min-h-[calc(100vh-64px)] grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8'
        }
      >
        {!hideNavigation ? <DashboardSidebar pathname={pathname} /> : null}
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

function DashboardRedirectState({ message = 'Перенаправляем на страницу входа...' }: { message?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  );
}
