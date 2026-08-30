import type { FormEvent } from 'react';
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

import { BillingPromoForm } from './billing-promo-form';
import { formatRub } from './billing-utils';
import type { PromoMessageTone } from './use-billing-page';
import styles from '../billing.module.css';

export function BillingCheckoutPanel(props: {
  plan?: { name: string; tokens: number; priceRub: number };
  discount?: { finalAmount: number; discountAmount: number } | null;
  promoCode: string; setPromoCode: (value: string) => void;
  promoMessage: string; promoTone: PromoMessageTone; promoPending: boolean;
  onPromoSubmit: (event: FormEvent<HTMLFormElement>) => void;
  checkoutPending: boolean; checkoutError: string; checkoutMessage: string;
  onCheckout: () => void;
}) {
  const total = props.discount?.finalAmount ?? props.plan?.priceRub ?? 0;
  return (
    <aside className="xl:sticky xl:top-24">
      <section className="min-h-[33rem] rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/30">Оформление</p>
        <div key={props.plan?.name} className={styles.selection}>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div><h2 className="text-2xl font-medium tracking-[-0.03em] text-white">{props.plan?.name}</h2>
              <p className="mt-1 text-sm text-white/35">{props.plan?.tokens} кредитов</p></div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.68rem] text-white/45">выбран</span>
          </div>
        </div>
        <div className="mt-6 space-y-3 border-y border-white/[0.08] py-5 text-sm">
          <div className="flex justify-between gap-4 text-white/40"><span>Пакет</span><span>{formatRub(props.plan?.priceRub ?? 0)}</span></div>
          <div className="flex min-h-5 justify-between gap-4 text-white/40"><span>Скидка</span>
            <span>{props.discount ? `− ${formatRub(props.discount.discountAmount)}` : '—'}</span></div>
          <div className="flex justify-between gap-4 pt-2 text-base font-medium text-white"><span>Итого</span><span>{formatRub(total)}</span></div>
        </div>
        <BillingPromoForm promoCode={props.promoCode} setPromoCode={props.setPromoCode}
          message={props.promoMessage} tone={props.promoTone} pending={props.promoPending}
          onSubmit={props.onPromoSubmit} />
        <button type="button" disabled={props.checkoutPending} onClick={props.onCheckout}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563a9] px-5 text-sm font-medium text-white transition-[background-color,box-shadow] hover:bg-[#2b6fba] hover:shadow-[0_12px_32px_rgba(24,88,155,0.22)] disabled:cursor-not-allowed disabled:opacity-50">
          {props.checkoutPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Перейти к оплате<ArrowRight className="h-4 w-4" /></>}
        </button>
        <div className="mt-3 min-h-10" aria-live="polite">
          {props.checkoutError ? <p className="text-xs leading-5 text-amber-300">{props.checkoutError}</p>
            : props.checkoutMessage ? <p className="text-xs leading-5 text-white/40">{props.checkoutMessage}</p> : null}
        </div>
        <div className="mt-2 grid gap-3 border-t border-white/[0.08] pt-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/40" /><p className="text-xs leading-5 text-white/30">Защищённая платёжная страница</p></div>
          <div className="flex items-start gap-2.5"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-white/40" /><p className="text-xs leading-5 text-white/30">Данные карты не хранятся в сервисе</p></div>
        </div>
      </section>
    </aside>
  );
}
