import type { AdminSubscription } from '@/src/shared/api/admin';

import { formatAdminDate } from './admin-overview-format';

export function AdminSubscriptionsTable({ subscriptions }: { subscriptions: AdminSubscription[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium tracking-tight text-foreground">Подписки</h2>
        <p className="text-xs text-muted-foreground">Данные появятся после подключения оплаты</p>
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
            {subscriptions.length ? subscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b border-border/70">
                <td className="py-3 pr-4 text-foreground">{subscription.email ?? subscription.userId}</td>
                <td className="py-3 pr-4 text-muted-foreground">{subscription.plan}</td>
                <td className="py-3 pr-4 text-muted-foreground">{subscription.status}</td>
                <td className="py-3 pr-4 text-muted-foreground">{formatAdminDate(subscription.currentPeriodEnd)}</td>
                <td className="py-3 text-muted-foreground">{formatAdminDate(subscription.createdAt)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Платных подписок пока нет.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
