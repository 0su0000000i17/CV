'use client';

import { Coins } from 'lucide-react';
import { AdminPendingPayments } from './admin-pending-payments';
import { AdminProcessedPayments } from './admin-processed-payments';
import { AdminTokenUsers } from './admin-token-users';
import { useAdminTokens } from './use-admin-tokens';

export function AdminTokensSection({ accessToken }: { accessToken: string }) {
  const state = useAdminTokens(accessToken);
  return <section className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20"><Coins className="h-5 w-5" /></div>
      <div><h2 className="text-lg font-medium text-foreground">Кредиты и платежи</h2>
        <p className="mt-1 text-sm text-muted-foreground">Начисление кредитов пользователям и подтверждение оплат (пока оплата не подключена — подтверждение ручное, после подключения провайдера этим займётся вебхук).</p>
        {state.message ? <p className="mt-2 text-sm text-emerald-300">{state.message}</p> : null}</div>
    </div>
    <AdminPendingPayments state={state} />
    <AdminTokenUsers state={state} />
    <AdminProcessedPayments state={state} />
  </section>;
}
