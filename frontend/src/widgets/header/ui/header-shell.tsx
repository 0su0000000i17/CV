import { forwardRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { Logo } from '@/src/shared/ui/logo';
import { HeaderNavLinks } from './header-nav-links';
import { DesktopAuthControl } from './desktop-auth-control';
import { MobileMenuButton } from './mobile-menu-button';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';
import styles from './header.module.css';

export const HeaderShell = forwardRef<HTMLElement, {
  pathname: string;
  isDashboard: boolean; hidden: boolean; expanded: boolean; menuOpen: boolean;
  showDashboard: boolean; isLoginPage: boolean; loading: boolean;
  authenticated: boolean; fullName: string; email: string; profileLoading: boolean;
  onHome: (event: MouseEvent<HTMLAnchorElement>) => void;
  onToggleMenu: () => void; onNavigate: () => void;
}>(function HeaderShell(props, ref) {
  return <>
    <header ref={ref}
      className={`${styles.headerEnter} ${styles.headerMotion} ${props.isDashboard && props.hidden ? styles.headerHidden : ''} fixed inset-x-0 top-4 z-[60] px-3 sm:px-4`}>
      <div className={`${styles.headerGlass} ${styles.headerShell} ${props.expanded ? styles.headerShellExpanded : ''} ${props.isDashboard ? styles.headerShellDashboard : ''} mx-auto flex h-[50px] w-full items-center rounded-[1.1rem] border border-white/10 px-3 sm:px-4`}>
        <div className="flex flex-1 items-center"><Link href="/" onClick={props.onHome}
          className="inline-flex items-center rounded-lg text-foreground/90 transition-[color,opacity,transform] duration-200 ease-out hover:text-white hover:opacity-80 active:scale-[0.96]"
          aria-label={props.pathname === '/' ? 'Наверх' : 'На главную'}><Logo /></Link></div>
        <nav className={`${styles.headerCenterNav} ${props.isDashboard ? styles.headerCenterNavDashboard : ''} hidden h-11 items-center gap-1 px-2 text-sm font-medium md:flex`}>
          {props.isDashboard ? <Link href="/" onClick={props.onHome}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-foreground/70 transition-[color,background-color,transform] duration-150 ease-out hover:bg-white/[0.055] hover:text-foreground active:scale-[0.98]">На главную</Link>
            : <HeaderNavLinks isDashboard={props.isDashboard} showDashboard={props.showDashboard} />}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2"><ThemeToggle />
          <div className="hidden h-10 w-20 shrink-0 md:block"><DesktopAuthControl
            isLoginPage={props.isLoginPage} loading={props.loading}
            authenticated={props.authenticated} fullName={props.fullName} email={props.email}
            profileLoading={props.profileLoading} /></div>
          <MobileMenuButton isOpen={props.menuOpen} onClick={props.onToggleMenu}
            isDashboard={props.isDashboard} />
        </div>
      </div>
      <MobileMenu isOpen={props.menuOpen} isDashboard={props.isDashboard}
        showDashboard={props.showDashboard} isLoginPage={props.isLoginPage}
        loading={props.loading} authenticated={props.authenticated}
        fullName={props.fullName} email={props.email} onNavigate={props.onNavigate} />
    </header>
    <div aria-hidden="true" className="h-[66px] shrink-0" />
  </>;
});
