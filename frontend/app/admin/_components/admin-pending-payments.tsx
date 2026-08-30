import { BadgeCheck, Ban } from 'lucide-react';
import type { AdminTokensState } from './use-admin-tokens';
import { formatAdminDate, formatAdminNumber } from './admin-token-utils';

export function AdminPendingPayments({ state }: { state: AdminTokensState }) {
  if (!state.pending.length) return null;
  return <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
    <h3 className="text-sm font-medium text-amber-300">Ожидают подтверждения ({state.pending.length})</h3>
    <div className="mt-3 space-y-2">{state.pending.map((payment) =>
      <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
        <div className="min-w-0 text-sm"><p className="font-medium text-foreground">{payment.email ?? payment.user_id} — {payment.plan_id}</p>
          <p className="text-muted-foreground">{formatAdminNumber(Number(payment.amount_rub))} ₽ → {formatAdminNumber(payment.tokens)} кредитов
            {payment.promo_code ? ` · промокод ${payment.promo_code}` : ''} · {formatAdminDate(payment.created_at)}</p></div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={state.confirmMutation.isPending} onClick={() => state.confirmMutation.mutate(payment.id)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"><BadgeCheck className="h-3.5 w-3.5" />Подтвердить оплату</button>
          <button type="button" disabled={state.cancelMutation.isPending} onClick={() => state.cancelMutation.mutate(payment.id)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"><Ban className="h-3.5 w-3.5" />Отменить</button>
        </div>
      </div>)}</div>
  </div>;
}
