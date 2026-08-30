'use client';

import { Check, Coins } from 'lucide-react';

import type { BillingPlan } from './billing-data';
import { formatRub } from './billing-utils';
import type { PromoCodeValidationResponse } from '@/src/shared/api/billing';

type Props = {
  plan: BillingPlan;
  isSelected: boolean;
  discount: PromoCodeValidationResponse | null;
  onSelect: (planName: string) => void;
};

export function BillingPlanCard({
  plan,
  isSelected,
  discount,
  onSelect,
}: Props) {
  const isSelectable = plan.isSelectable !== false;
  const pricePerCredit =
    plan.priceRub > 0 ? Math.round(plan.priceRub / plan.tokens) : 0;

  return (
    <button
      type="button"
      disabled={!isSelectable}
      aria-pressed={isSelected}
      onClick={() => onSelect(plan.name)}
      className={`group relative flex h-full min-h-56 w-full flex-col rounded-2xl border p-5 text-left transition-[background-color,border-color,box-shadow] disabled:cursor-default ${
        isSelected
          ? 'border-white/25 bg-white/[0.075] shadow-[0_18px_50px_rgba(0,0,0,0.18)]'
          : isSelectable
            ? 'border-white/10 bg-white/[0.018] hover:border-white/20 hover:bg-white/[0.035]'
            : 'border-white/[0.07] bg-white/[0.01] opacity-45'
      }`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55">
          <Coins className="h-4 w-4" strokeWidth={1.7} />
        </span>
        {isSelected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[0.68rem] text-white/70">
            <Check className="h-3 w-3" />
            Выбран
          </span>
        ) : plan.badge ? (
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.68rem] text-white/45">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-lg font-medium text-white">{plan.name}</p>
      <p className="mt-1 min-h-10 text-xs leading-5 text-white/35">
        {plan.description}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex items-end gap-2">
          {discount ? (
            <span className="pb-1 text-xs text-white/30 line-through">
              {formatRub(plan.priceRub)}
            </span>
          ) : null}
          <span className="text-2xl font-medium tracking-[-0.04em] text-white">
            {formatRub(discount?.finalAmount ?? plan.priceRub)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-white/55">{plan.tokens} кредитов</span>
          {pricePerCredit ? (
            <span className="text-white/25">≈ {pricePerCredit} ₽ / кредит</span>
          ) : (
            <span className="text-white/25">включено</span>
          )}
        </div>
      </div>
    </button>
  );
}
