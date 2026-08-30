'use client';

import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';
import { HeaderShell } from './header-shell';
import { useDashboardHeaderVisibility } from './use-dashboard-header-visibility';
import { useHomeNavigation } from './use-home-navigation';

export function Header() {
  const { user, accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ pathname, isOpen: false });
  const headerRef = useRef<HTMLElement>(null);
  const isDashboard = pathname.startsWith('/dashboard');
  const authenticated = Boolean(user);
  const showDashboard = !loading && authenticated;
  const menuOpen = menuState.pathname === pathname && menuState.isOpen;
  const profile = profileQuery.data?.profile;
  const email = profile?.email || user?.email || '';
  const fullName = profile?.full_name || email.split('@')[0] || 'Пользователь';
  const hidden = useDashboardHeaderVisibility({
    headerRef, isDashboard, loading, pathname, profileLoading: profileQuery.isLoading,
  });
  const navigate = () => setMenuState({ pathname, isOpen: false });
  const home = useHomeNavigation(pathname, navigate);
  return <HeaderShell ref={headerRef} pathname={pathname}
    isDashboard={isDashboard} hidden={hidden}
    expanded={!isDashboard && showDashboard} menuOpen={menuOpen}
    showDashboard={showDashboard} isLoginPage={pathname === '/login'}
    loading={loading} authenticated={authenticated} fullName={fullName} email={email}
    profileLoading={profileQuery.isLoading} onHome={home}
    onToggleMenu={() => setMenuState((current) => ({ pathname,
      isOpen: current.pathname === pathname ? !current.isOpen : true }))}
    onNavigate={navigate} />;
}
