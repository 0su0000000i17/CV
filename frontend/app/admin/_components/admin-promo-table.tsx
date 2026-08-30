import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { discountLabel, formatPromoDate } from './admin-promo-model';
import type { AdminPromoState } from './use-admin-promo-codes';

export function AdminPromoTable({ state }: { state: AdminPromoState }) {
  if (state.query.isPending) return <div className="mt-5"><p className="text-sm text-muted-foreground">Загружаем промокоды...</p></div>;
  if (state.query.isError) return <div className="mt-5"><p className="text-sm text-red-300">Не удалось загрузить промокоды. Проверьте SQL-миграцию.</p></div>;
  const promos = state.query.data.promoCodes;
  if (!promos.length) return <div className="mt-5"><p className="text-sm text-muted-foreground">Промокодов пока нет.</p></div>;
  return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm">
    <thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr className="border-b border-border">
      {['Код', 'Скидка', 'Использования', 'Начало', 'Окончание', 'Статус', 'Действия'].map((item) =>
        <th key={item} className="pb-3 pr-4 font-medium">{item}</th>)}</tr></thead>
    <tbody>{promos.map((promo) => <tr key={promo.id} className="border-b border-border/70">
      <td className="py-3 pr-4 text-foreground"><p className="font-medium">{promo.code}</p><p className="mt-1 text-xs text-muted-foreground">{promo.description || 'Без описания'}</p></td>
      <td className="py-3 pr-4 text-muted-foreground">{discountLabel(promo)}</td>
      <td className="py-3 pr-4 text-muted-foreground">{promo.redemptionsCount}{promo.maxRedemptions ? ` / ${promo.maxRedemptions}` : ''}</td>
      <td className="py-3 pr-4 text-muted-foreground">{formatPromoDate(promo.startsAt)}</td>
      <td className="py-3 pr-4 text-muted-foreground">{formatPromoDate(promo.expiresAt)}</td>
      <td className="py-3 pr-4 text-muted-foreground">{promo.isActive ? 'Активен' : 'Выключен'}</td>
      <td className="py-3"><div className="flex flex-wrap gap-2">
        <button type="button" disabled={state.toggleMutation.isPending}
          onClick={() => state.toggleMutation.mutate({ id: promo.id, active: !promo.isActive })}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60">
          {promo.isActive ? <ToggleRight className="h-4 w-4 text-brand-400" /> : <ToggleLeft className="h-4 w-4" />}{promo.isActive ? 'Выключить' : 'Включить'}</button>
        <button type="button" disabled={state.deleteMutation.isPending} onClick={() => state.deletePromo(promo)}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${state.confirmingDeleteId === promo.id ? 'border-red-500/60 bg-red-500/10 text-red-200' : 'border-red-500/30 text-red-300 hover:bg-red-500/10'}`}>
          <Trash2 className="h-4 w-4" />{state.confirmingDeleteId === promo.id ? 'Точно удалить?' : 'Удалить'}</button>
      </div></td>
    </tr>)}</tbody>
  </table></div>;
}
