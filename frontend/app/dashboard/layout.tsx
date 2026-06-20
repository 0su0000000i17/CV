"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileText,
  History,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    title: "Обзор",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Мои резюме",
    href: "/dashboard/resumes",
    icon: FileText,
  },
  {
    title: "Адаптация",
    href: "/dashboard/adapt",
    icon: Sparkles,
  },
  {
    title: "Оценка резюме",
    href: "/dashboard/analyze",
    icon: BarChart3,
  },
  {
    title: "История",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Оплата",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:flex lg:flex-col">
        <div className="fixed top-24 bottom-30 w-[280px] flex flex-col rounded-2xl border border-border bg-card/60 p-4 overflow-y-auto">
          <div className="px-3 pb-6 pt-2">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              CV Prophet
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
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-background"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-foreground">Тариф: Free</p>

            <p className="mt-3 text-xs text-muted-foreground">
              Адаптации в этом месяце
            </p>

            <div className="mt-3 flex items-end gap-1">
              <span className="text-2xl font-semibold text-foreground">0</span>
              <span className="pb-1 text-sm text-muted-foreground">/ 10</span>
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
  );
}