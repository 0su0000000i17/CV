import Link from 'next/link';

import styles from './dashboard-sidebar.module.css';

import {
  dashboardNavigationGroups,
  isDashboardRouteActive,
} from '@/src/shared/config/dashboard-navigation';
import { TokenBalanceCard } from '@/src/widgets/header/ui/token-balance-card';

export function DashboardSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden min-w-0 lg:block">
      <div
        className={`${styles.sidebar} fixed bottom-6 top-20 flex min-h-0 flex-col overflow-y-auto rounded-[1.5rem] border border-white/10 bg-white/[0.015] p-3 lg:w-[240px] xl:w-[280px] xl:p-4`}
      >
        <div className="px-3 pb-5 pt-2">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/30">
            Рабочее пространство
          </p>
          <p className="mt-1.5 text-lg font-medium tracking-[-0.025em] text-white">
            Личный кабинет
          </p>
        </div>

        <nav
          className="flex min-h-0 flex-col gap-5"
          aria-label="Личный кабинет"
        >
          {dashboardNavigationGroups.map((group) => (
            <div key={group.label} className={styles.group}>
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
                      className={`group flex min-h-10 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-[color,background-color,border-color,transform] active:scale-[0.985] ${
                        active
                          ? 'border-white/15 bg-white/[0.075] text-white'
                          : 'border-transparent text-white/45 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-white/85'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          active
                            ? 'text-white/85'
                            : 'text-white/35 group-hover:text-white/65'
                        }`}
                        strokeWidth={1.7}
                      />
                      <span className="min-w-0 flex-1 break-words leading-5">
                        {item.title}
                      </span>
                      {active ? (
                        <span
                          className={`${styles.activeMark} h-1.5 w-1.5 shrink-0 rounded-full bg-white/80`}
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

        <TokenBalanceCard className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.018] p-3 xl:mt-auto" />
      </div>
    </aside>
  );
}
