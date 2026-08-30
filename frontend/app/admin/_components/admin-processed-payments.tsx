import type { AdminTokensState } from './use-admin-tokens';
import { formatAdminDate, formatAdminNumber, paymentStatusClass, paymentStatusLabels } from './admin-token-utils';

export function AdminProcessedPayments({ state }: { state: AdminTokensState }) {
  if (!state.processed.length) return null;
  return <div className="mt-5"><h3 className="text-sm font-medium text-muted-foreground">Последние обработанные платежи</h3>
    <div className="mt-2 space-y-1.5">{state.processed.map((payment) =>
      <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
        <span className="min-w-0 truncate text-muted-foreground">{payment.email ?? payment.user_id} · {payment.plan_id} · {formatAdminNumber(Number(payment.amount_rub))} ₽ · {formatAdminDate(payment.created_at)}</span>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ${paymentStatusClass(payment.status)}`}>{paymentStatusLabels[payment.status] ?? payment.status}</span>
      </div>)}</div>
  </div>;
}
