import { DashboardMobileMenu } from './dashboard-mobile-menu';
import { HeaderNavLinks } from './header-nav-links';
import { MobileAccountMenu } from './mobile-account-menu';

type Props = {
  isOpen: boolean;
  isDashboard: boolean;
  showDashboard: boolean;
  isLoginPage: boolean;
  loading: boolean;
  authenticated: boolean;
  fullName: string;
  email: string;
  onNavigate: () => void;
};

export function MobileMenu({
  isOpen,
  isDashboard,
  showDashboard,
  isLoginPage,
  loading,
  authenticated,
  fullName,
  email,
  onNavigate,
}: Props) {
  const visibilityClass = isDashboard ? 'lg:hidden' : 'md:hidden';

  return (
    <>
      <button
        type="button"
        aria-label="Закрыть меню"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onNavigate}
        className={`fixed inset-x-0 bottom-0 top-[66px] z-[55] bg-black/45 transition-opacity duration-200 motion-reduce:transition-none ${visibilityClass} ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        id="mobile-navigation-menu"
        aria-hidden={!isOpen}
        className={`fixed left-3 right-3 top-[74px] z-[60] mx-auto max-h-[calc(100dvh-86px)] max-w-[28rem] origin-top overflow-y-auto overscroll-contain rounded-[1.35rem] border border-white/10 bg-transparent p-3 shadow-[0_24px_80px_rgba(0,0,0,0.52)] backdrop-blur-[18px] backdrop-saturate-[1.5] transition-[opacity,transform,filter] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${visibilityClass} ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100 blur-none'
            : 'pointer-events-none -translate-y-2 scale-[0.975] opacity-0 blur-[0.55rem]'
        }`}
      >
        {isDashboard ? (
          <DashboardMobileMenu onNavigate={onNavigate} />
        ) : (
          <nav className="flex flex-col text-sm font-medium">
            <div className="px-3 pb-2 pt-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/35">
              Навигация
            </div>

            <HeaderNavLinks
              isDashboard={isDashboard}
              showDashboard={showDashboard}
              onNavigate={onNavigate}
              variant="mobile"
            />

            {!isLoginPage && !loading ? (
              <div className="mt-3 border-t border-white/10 pt-3">
                <MobileAccountMenu
                  authenticated={authenticated}
                  email={email}
                  fullName={fullName}
                  onNavigate={onNavigate}
                />
              </div>
            ) : null}
          </nav>
        )}
      </div>
    </>
  );
}
