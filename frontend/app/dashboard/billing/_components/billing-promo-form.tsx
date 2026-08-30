import type { FormEvent } from 'react';
import { Loader2, Tag } from 'lucide-react';

import { normalizePromoCode } from './billing-utils';
import type { PromoMessageTone } from './use-billing-page';

export function BillingPromoForm(props: {
  promoCode: string;
  setPromoCode: (value: string) => void;
  message: string;
  tone: PromoMessageTone;
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="mt-5">
      <label className="text-xs font-medium text-white/45" htmlFor="promo-code">Промокод</label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
          <input id="promo-code" value={props.promoCode}
            onChange={(event) => props.setPromoCode(normalizePromoCode(event.target.value))}
            placeholder="Код скидки"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] pl-9 pr-3 text-sm text-white outline-none transition-[background-color,border-color] placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.04]" />
        </div>
        <button type="submit" disabled={!props.promoCode || props.pending}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-medium text-white/65 transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-35">
          {props.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Применить'}
        </button>
      </div>
      <p className={`mt-2 min-h-5 text-xs ${props.tone === 'success' ? 'text-emerald-300' : props.tone === 'warning' ? 'text-amber-300' : 'text-white/25'}`} aria-live="polite">
        {props.message || 'Если есть промокод, примените его до оплаты.'}
      </p>
    </form>
  );
}
