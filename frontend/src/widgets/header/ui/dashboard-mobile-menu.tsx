import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Mail,
  Settings,
  Sparkles,
} from "lucide-react";

const dashboardNavItems = [
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
    title: "Адаптировать под вакансию",
    href: "/dashboard/adapt",
    icon: Sparkles,
  },
  {
    title: "Сопроводительное письмо",
    href: "/dashboard/cover-letter",
    icon: Mail,
  },
  {
    title: "Оценить резюме",
    href: "/dashboard/analyze",
    icon: BarChart3,
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

type Props = {
  onNavigate: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardMobileMenu({ onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-2xl">
      <div className="px-3 pb-5 pt-2">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          CV<span className="text-emerald-500">Pro</span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">Личный кабинет</p>
      </div>

      <nav className="flex flex-col gap-1">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  active
                    ? "text-background"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />

              <span className="min-w-0 break-words leading-5">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-border bg-card/60 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            Тариф:{" "}
            <span className="font-semibold uppercase tracking-wide text-emerald-500">
              Free
            </span>
          </p>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-500">
            5 / мес
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-xs text-muted-foreground">Бесплатные генерации</p>
          <p className="whitespace-nowrap text-sm font-semibold text-foreground">
            0<span className="text-muted-foreground"> / 5</span>
          </p>
        </div>

        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div className="h-1.5 w-0 rounded-full bg-foreground" />
        </div>

        <Link
          href="/dashboard/billing"
          onClick={onNavigate}
          className="mt-3 block text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Улучшить тариф →
        </Link>
      </div>
    </div>
  );
}
