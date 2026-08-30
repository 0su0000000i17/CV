import { Activity, BarChart3, CreditCard, FileText, ShieldCheck, Users } from 'lucide-react';

import type { AdminMetricSummary } from '@/src/shared/api/admin';

import { formatAdminNumber } from './admin-overview-format';

export function AdminMetricsGrid({ metrics }: { metrics: AdminMetricSummary }) {
  const items = [
    { title: 'Пользователи', value: metrics.usersTotal, hint: `+${metrics.users7d} за 7 дней`, icon: Users },
    { title: 'Активные за 7 дней', value: metrics.activeUsers7d, hint: 'логины, резюме, оценки, события', icon: Activity },
    { title: 'Оплатившие', value: metrics.paidUsers, hint: `${metrics.activeSubscriptions} активных подписок`, icon: CreditCard },
    { title: 'Резюме', value: metrics.resumesTotal, hint: `+${metrics.resumes7d} за 7 дней`, icon: FileText },
    { title: 'Оценки резюме', value: metrics.analysesTotal, hint: `+${metrics.analyses7d} за 7 дней`, icon: BarChart3 },
    { title: 'AI-события', value: metrics.eventsTotal, hint: `+${metrics.events7d} за 7 дней`, icon: ShieldCheck },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {formatAdminNumber(item.value)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-2 text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{item.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
