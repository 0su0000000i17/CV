'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { DashboardPageLoading } from './dashboard-page-loading';
import { DashboardResumeSelectionProvider } from './dashboard-resume-selection-provider';
import { DashboardSidebar } from './dashboard-sidebar';
import routeStyles from './dashboard-route-transition.module.css';

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
    if (loading || !user || !accessToken || profileQuery.isLoading || !profile)
      return;

    if (!profileName && !isOnboardingPage) {
      router.replace('/dashboard/onboarding');
      return;
    }

    if (profileName && isOnboardingPage) {
      router.replace('/dashboard');
    }
  }, [
    accessToken,
    isOnboardingPage,
    loading,
    profile,
    profileName,
    profileQuery.isLoading,
    router,
    user,
  ]);

  if (loading || (user && accessToken && profileQuery.isLoading)) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    return <DashboardRedirectState />;
  }

  if (accessToken && profile && !profileName && !isOnboardingPage) {
    return (
      <DashboardRedirectState message="Открываем первый шаг настройки..." />
    );
  }

  return (
    <DashboardResumeSelectionProvider>
      <div
        data-dashboard-header-anchor={!hideNavigation ? '' : undefined}
        className={
          hideNavigation
            ? 'min-h-[calc(100vh-64px)]'
            : 'grid min-h-[calc(100vh-64px)] grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8'
        }
      >
        {!hideNavigation ? <DashboardSidebar pathname={pathname} /> : null}
        <section className="min-w-0 pb-8">
          <div key={pathname} className={routeStyles.routeStage}>
            {children}
          </div>
        </section>
      </div>
    </DashboardResumeSelectionProvider>
  );
}

function DashboardLoadingState() {
  return <DashboardPageLoading label="Проверяем сессию..." />;
}

function DashboardRedirectState({
  message = 'Перенаправляем на страницу входа...',
}: {
  message?: string;
}) {
  return <DashboardPageLoading label={message} />;
}
