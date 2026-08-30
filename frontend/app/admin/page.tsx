'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { getAdminOverview } from '@/src/shared/api/admin';
import { useAuth } from '@/src/shared/hooks/use-auth';

import { AdminMetricsGrid } from './_components/admin-metrics-grid';
import { AdminRecentUsersTable } from './_components/admin-recent-users-table';
import { AdminSubscriptionsTable } from './_components/admin-subscriptions-table';
import { AdminUsageCard } from './_components/admin-usage-card';

export default function AdminOverviewPage() {
  const { accessToken } = useAuth();
  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => getAdminOverview(accessToken as string),
    enabled: Boolean(accessToken),
    retry: false,
  });

  if (overviewQuery.isPending) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загружаем обзор...
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return <p className="rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-red-300">Не удалось загрузить обзор.</p>;
  }

  const overview = overviewQuery.data;
  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Метрики продукта, активность пользователей и подписки за последнее время.
      </p>
      <AdminMetricsGrid metrics={overview.metrics} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminUsageCard title="Активность за 7 дней" events={overview.usage.last7d} />
        <AdminUsageCard title="Активность за 30 дней" events={overview.usage.last30d} />
      </div>
      <AdminSubscriptionsTable subscriptions={overview.subscriptions} />
      <AdminRecentUsersTable users={overview.recentUsers} />
    </div>
  );
}
