'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Coins, Gift, Radar } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Обзор', icon: BarChart3 },
  { href: '/admin/tokens', label: 'Токены и платежи', icon: Coins },
  { href: '/admin/promo-codes', label: 'Промокоды', icon: Gift },
  { href: '/admin/traffic-sources', label: 'Источники трафика', icon: Radar },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Admin / Monitoring</p>
          <h1 className="text-4xl font-normal tracking-tight text-foreground">Админ-панель</h1>
        </div>

        <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          В кабинет
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-foreground/20 bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
