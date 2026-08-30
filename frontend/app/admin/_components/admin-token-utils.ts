import type { AdminPayment } from '@/src/shared/api/admin';

export function formatAdminDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value)) : '—';
}
export const formatAdminNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
export const paymentStatusLabels: Record<string, string> = {
  pending: 'Ожидает оплаты', succeeded: 'Оплачен', canceled: 'Отменён', refunded: 'Возврат',
};
export function paymentStatusClass(status: AdminPayment['status']) {
  if (status === 'succeeded') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'pending') return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  return 'border-border bg-background text-muted-foreground';
}
