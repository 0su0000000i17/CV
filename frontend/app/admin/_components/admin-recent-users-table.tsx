import type { AdminRecentUser } from '@/src/shared/api/admin';

import { formatAdminDate } from './admin-overview-format';

export function AdminRecentUsersTable({ users }: { users: AdminRecentUser[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <h2 className="text-lg font-medium tracking-tight text-foreground">Последние пользователи</h2>
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
                <td className="py-3 pr-4 text-foreground">{user.email ?? user.id}</td>
                <td className="py-3 pr-4 text-muted-foreground">{user.fullName || '—'}</td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.subscription ? `${user.subscription.plan} / ${user.subscription.status}` : 'Free'}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{user.resumesCount}</td>
                <td className="py-3 pr-4 text-muted-foreground">{user.analysesCount}</td>
                <td className="py-3 pr-4 text-muted-foreground">{formatAdminDate(user.createdAt)}</td>
                <td className="py-3 text-muted-foreground">{formatAdminDate(user.lastActivityAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
