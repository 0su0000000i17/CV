'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  CreditCard,
  FileText,
  Loader2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';

import {
  type AdminMetricSummary,
  type AdminRecentUser,
  type AdminSubscription,
  getAdminOverview,
} from '@/src/shared/api/admin';
import { useAuth } from '@/src/shared/hooks/use-auth';

const eventLabels: Record<string, string> = {
  resume_uploaded: 'Загрузка резюме',
  resume_analyzed: 'Оценка резюме',
  vacancy_fit_checked: 'Проверка вакансии',
  resume_adapted: 'Адаптация резюме',
  cover_letter_generated: 'Сопроводительное',
};

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export default function AdminPage() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/admin');
    }
  }, [loading, router, user]);

  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => getAdminOverview(accessToken as string),
    enabled: Boolean(accessToken),
    retry: false,
  });

  if (loading || (!overviewQuery.data && overviewQuery.isLoading)) {
    return <AdminLoadingState />;
  }

  if (!user) {
    return <AdminLoadingState text="Перенаправляем на страницу входа..." />;
  }

  if (overviewQuery.isError) {
    return <AdminErrorState message={overviewQuery.error.message} />;
  }

  const overview = overviewQuery.data;

  if (!overview) {
    return <AdminLoadingState />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Admin / Monitoring
          </p>

          <h1 className="text-4xl font-normal tracking-tight text-foreground">
            Админ-панель
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Минимальный мониторинг спроса: регистрации, активность, резюме,
            оценки и подписки.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          В кабинет
        </Link>
      </div>

      <MetricsGrid metrics={overview.metrics} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <UsageCard title="Активность за 7 дней" events={overview.usage.last7d} />
        <UsageCard title="Активность за 30 дней" events={overview.usage.last30d} />
      </div>

      <SubscriptionsTable subscriptions={overview.subscriptions} />
      <RecentUsersTable users={overview.recentUsers} />
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: AdminMetricSummary }) {
  const items = [
    {
      title: 'Пользователи',
      value: metrics.usersTotal,
      hint: `+${metrics.users7d} за 7 дней`,
      icon: Users,
    },
    {
      title: 'Активные за 7 дней',
      value: metrics.activeUsers7d,
      hint: 'логины, резюме, оценки, события',
      icon: Activity,
    },
    {
      title: 'Оплатившие',
      value: metrics.paidUsers,
      hint: `${metrics.activeSubscriptions} активных подписок`,
      icon: CreditCard,
    },
    {
      title: 'Резюме',
      value: metrics.resumesTotal,
      hint: `+${metrics.resumes7d} за 7 дней`,
      icon: FileText,
    },
    {
      title: 'Оценки резюме',
      value: metrics.analysesTotal,
      hint: `+${metrics.analyses7d} за 7 дней`,
      icon: BarChart3,
    },
    {
      title: 'AI-события',
      value: metrics.eventsTotal,
      hint: `+${metrics.events7d} за 7 дней`,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {formatNumber(item.value)}
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

function UsageCard({
  title,
  events,
}: {
  title: string;
  events: Array<{ eventType: string; count: number }>;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <h2 className="text-lg font-medium tracking-tight text-foreground">
        {title}
      </h2>

      {events.length ? (
        <div className="mt-5 space-y-3">
          {events.map((event) => (
            <div
              key={event.eventType}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3"
            >
              <p className="text-sm text-muted-foreground">
                {eventLabels[event.eventType] ?? event.eventType}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatNumber(event.count)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Пока нет сохранённых событий. Новые события начнут появляться после
          подключения логирования действий.
        </p>
      )}
    </section>
  );
}

function SubscriptionsTable({
  subscriptions,
}: {
  subscriptions: AdminSubscription[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Подписки
        </h2>

        <p className="text-xs text-muted-foreground">
          Данные появятся после подключения оплаты
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 font-medium">Пользователь</th>
              <th className="pb-3 pr-4 font-medium">Тариф</th>
              <th className="pb-3 pr-4 font-medium">Статус</th>
              <th className="pb-3 pr-4 font-medium">До</th>
              <th className="pb-3 font-medium">Создана</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.length ? (
              subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-border/70">
                  <td className="py-3 pr-4 text-foreground">
                    {subscription.email ?? subscription.userId}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {subscription.plan}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {subscription.status}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {formatDate(subscription.currentPeriodEnd)}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(subscription.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  Платных подписок пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecentUsersTable({ users }: { users: AdminRecentUser[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <h2 className="text-lg font-medium tracking-tight text-foreground">
        Последние пользователи
      </h2>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Имя</th>
              <th className="pb-3 pr-4 font-medium">Подписка</th>
              <th className="pb-3 pr-4 font-medium">Резюме</th>
              <th className="pb-3 pr-4 font-medium">Оценки</th>
              <th className="pb-3 pr-4 font-medium">Регистрация</th>
              <th className="pb-3 font-medium">Активность</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border/70">
                <td className="py-3 pr-4 text-foreground">
                  {user.email ?? user.id}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.fullName || '—'}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.subscription
                    ? `${user.subscription.plan} / ${user.subscription.status}`
                    : 'Free'}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.resumesCount}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.analysesCount}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-3 text-muted-foreground">
                  {formatDate(user.lastActivityAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminLoadingState({ text = 'Загружаем админку...' }: { text?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {text}
      </div>
    </div>
  );
}

function AdminErrorState({ message }: { message: string }) {
  const isForbidden = message === 'Forbidden';

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card/60 p-6 text-center shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Admin access
        </p>

        <h1 className="mt-3 text-3xl font-normal tracking-tight text-foreground">
          {isForbidden ? 'Нет доступа к админке' : 'Не удалось открыть админку'}
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {isForbidden
            ? 'Добавьте свой auth user_id в таблицу admin_users в Supabase.'
            : message}
        </p>

        {isForbidden ? (
          <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-4 text-left text-xs text-muted-foreground">
            insert into public.admin_users (user_id){'\n'}values ('YOUR_AUTH_USER_ID')
            {'\n'}on conflict (user_id) do nothing;
          </pre>
        ) : null}
      </div>
    </div>
  );
}
