import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { ProjectSelect } from '@/src/shared/ui/project-select';
import { normalizeDiscount, normalizePromoCode, type PromoFormState } from './admin-promo-model';
import type { AdminPromoState } from './use-admin-promo-codes';

const input = 'mt-2 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-foreground/40';
const Label = ({ title, children }: { title: string; children: React.ReactNode }) =>
  <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{title}</span>{children}</label>;

export function AdminPromoForm({ state }: { state: AdminPromoState }) {
  const form = state.form;
  const submit = (event: FormEvent) => {
    event.preventDefault(); state.setMessage(''); state.createMutation.mutate();
  };
  const changeType = (value: PromoFormState['discountType']) => state.setForm((current) => ({
    ...current, discountType: value,
    discountValue: normalizeDiscount(current.discountValue, value),
  }));
  return <form onSubmit={submit} className="mt-5 rounded-2xl border border-border bg-background p-4">
    <div className="grid gap-3 md:grid-cols-[1fr_150px_1fr_120px_120px] md:items-end">
      <Label title="Код"><input value={form.code} onChange={(event) => state.update('code', normalizePromoCode(event.target.value))} placeholder="START20" className={input} /></Label>
      <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-foreground md:mt-6">
        <input type="checkbox" checked={form.personal} onChange={(event) => state.update('personal', event.target.checked)} className="h-4 w-4" />Личный</label>
      <Label title="Email получателя"><input value={form.targetEmail} onChange={(event) => state.update('targetEmail', event.target.value)} disabled={!form.personal}
        placeholder={form.personal ? 'friend@example.com' : 'для общего кода не нужен'} className={`${input} disabled:opacity-50`} /></Label>
      <Label title="Тип"><ProjectSelect value={form.discountType}
        onValueChange={(value) => changeType(value as PromoFormState['discountType'])}
        options={[{ value: 'percent', label: '%' }, { value: 'fixed', label: '₽' }]}
        ariaLabel="Тип скидки" size="compact" className="mt-2 border-border bg-card text-foreground" /></Label>
      <Label title="Скидка"><input value={form.discountValue}
        onChange={(event) => state.update('discountValue', normalizeDiscount(event.target.value, form.discountType))}
        inputMode="decimal" className={input} /></Label>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_120px_120px_200px_200px_140px] md:items-end">
      <Label title="Описание"><input value={form.description} onChange={(event) => state.update('description', event.target.value)} placeholder="Запуск, блогер, друг" className={input} /></Label>
      <Label title="Лимит"><input value={form.personal ? '1' : form.maxRedemptions}
        onChange={(event) => state.update('maxRedemptions', event.target.value)} disabled={form.personal}
        placeholder="без лимита" inputMode="numeric" className={`${input} disabled:opacity-50`} /></Label>
      <Label title="На юзера"><input value="1" disabled inputMode="numeric" className={`${input} opacity-50`} /></Label>
      <Label title="Начало"><input type="datetime-local" value={form.startsAt} onChange={(event) => state.update('startsAt', event.target.value)} className={input} /></Label>
      <Label title="Окончание"><input type="datetime-local" value={form.expiresAt} onChange={(event) => state.update('expiresAt', event.target.value)} className={input} /></Label>
      <button type="submit" disabled={state.createMutation.isPending}
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60">
        {state.createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Создать</button>
    </div>
    {state.message ? <p className="mt-3 text-sm text-muted-foreground">{state.message}</p> : null}
  </form>;
}
