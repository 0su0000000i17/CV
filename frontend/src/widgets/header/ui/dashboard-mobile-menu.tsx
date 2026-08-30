import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { TokenBalanceCard } from './token-balance-card';

import {
  dashboardNavigationGroups,
  isDashboardRouteActive,
} from '@/src/shared/config/dashboard-navigation';

type Props = {
  onNavigate: () => void;
};

export function DashboardMobileMenu({ onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="p-1">
      <div className="px-3 pb-5 pt-2">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/30">
          Рабочее пространство
        </p>
        <p className="mt-1.5 text-lg font-medium tracking-[-0.025em] text-white">
          Личный кабинет
        </p>
      </div>

      <nav className="flex flex-col gap-5" aria-label="Личный кабинет">
        {dashboardNavigationGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-white/25">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isDashboardRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={onNavigate}
                    className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-[color,background-color,border-color,transform] active:scale-[0.985] ${
                      active
                        ? 'border-white/15 bg-white/[0.075] text-white'
                        : 'border-transparent text-white/45 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-white/85'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-white/85' : 'text-white/35'
                      }`}
                      strokeWidth={1.7}
                    />
                    <span className="min-w-0 flex-1 break-words leading-5">
                      {item.title}
                    </span>
                    {active ? (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/80 shadow-[0_0_0.8rem_rgba(255,255,255,0.24)]"
                        aria-hidden="true"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <TokenBalanceCard
        className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.018] p-3"
        onNavigate={onNavigate}
      />
    </div>
  );
}
