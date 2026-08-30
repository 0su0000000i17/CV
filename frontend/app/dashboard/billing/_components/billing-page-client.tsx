'use client';

import type { FormEvent } from 'react';

import { plans } from './billing-data';
import { BillingPlanCard } from './billing-plan-card';
import { BillingCheckoutPanel } from './billing-checkout-panel';
import { BillingSummary } from './billing-summary';
import { useBillingPage } from './use-billing-page';
import styles from '../billing.module.css';
import { DashboardPageLoading } from '../../_components/dashboard-page-loading';

export function BillingPageClient() {
  const state = useBillingPage();
  if (!state.accessToken || state.tokenSummaryQuery.isPending) {
    return <DashboardPageLoading label="Загружаем оплату..." />;
  }
  function handlePromoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    state.setPromoMessage('');
    state.setPromoMessageTone(null);
    state.setAppliedPromo(null);
    state.validatePromoMutation.mutate();
  }
  return (
    <div className={`${styles.page} mx-auto max-w-[1120px]`}>
      <BillingSummary balance={state.tokenSummaryQuery.data?.balance ?? 0}
        costs={state.tokenSummaryQuery.data?.costs} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/30">Один платёж</p>
              <h2 className="mt-1 text-xl font-medium text-white">Выберите пакет</h2></div>
            <p className="text-xs text-white/30">Чем больше пакет, тем ниже цена кредита</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => <BillingPlanCard key={plan.name} plan={plan}
              isSelected={state.selectedPlan?.name === plan.name}
              discount={state.selectedPlan?.name === plan.name ? state.discount : null}
              onSelect={state.selectPlan} />)}
          </div>
        </section>
        <BillingCheckoutPanel plan={state.selectedPlan} discount={state.discount}
          promoCode={state.promoCode} setPromoCode={state.setPromoCode}
          promoMessage={state.promoMessage} promoTone={state.promoMessageTone}
          promoPending={state.validatePromoMutation.isPending} onPromoSubmit={handlePromoSubmit}
          checkoutPending={state.checkoutMutation.isPending} checkoutError={state.checkoutError}
          checkoutMessage={state.checkoutMessage} onCheckout={() => state.checkoutMutation.mutate()} />
      </div>
    </div>
  );
}
