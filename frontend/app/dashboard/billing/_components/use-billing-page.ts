'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { plans } from './billing-data';
import { applyPromoToPlan } from './billing-utils';
import {
  type PromoCodeValidationResponse,
  createBillingCheckout,
  validateBillingPromoCode,
} from '@/src/shared/api/billing';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useTokenSummaryQuery } from '@/src/shared/hooks/use-token-summary-query';

export type PromoMessageTone = 'success' | 'warning' | null;

export function useBillingPage() {
  const { accessToken } = useAuth();
  const [selectedPlanName, setSelectedPlanName] = useState('Про');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoMessageTone, setPromoMessageTone] = useState<PromoMessageTone>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeValidationResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.name === selectedPlanName),
    [selectedPlanName]
  );
  const tokenSummaryQuery = useTokenSummaryQuery(accessToken);
  const validatePromoMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('Нужно войти в аккаунт.');
      if (!selectedPlan) throw new Error('Сначала выберите пакет.');
      return validateBillingPromoCode({
        code: promoCode,
        amount: selectedPlan.priceRub,
        accessToken,
      });
    },
    onSuccess: (data) => {
      setAppliedPromo(data);
      setPromoMessage('Промокод применён');
      setPromoMessageTone('success');
    },
    onError: (error) => {
      setAppliedPromo(null);
      setPromoMessage(error instanceof Error ? error.message : 'Промокод не применён');
      setPromoMessageTone('warning');
    },
  });
  const checkoutMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('Нужно войти в аккаунт.');
      if (!selectedPlan?.id) throw new Error('Сначала выберите пакет.');
      return createBillingCheckout({
        planId: selectedPlan.id,
        promoCode: appliedPromo ? promoCode : undefined,
        accessToken,
      });
    },
    onSuccess: () => {
      setCheckoutError('');
      setCheckoutMessage('Заявка создана. Подключение оплаты появится здесь после настройки провайдера.');
    },
    onError: (error) => {
      setCheckoutMessage('');
      setCheckoutError(error instanceof Error ? error.message : 'Не удалось создать счёт');
    },
  });
  const discount = selectedPlan && appliedPromo
    ? applyPromoToPlan(appliedPromo, selectedPlan.priceRub)
    : null;

  function selectPlan(planName: string) {
    if (!plans.find((plan) => plan.name === planName)?.isSelectable) return;
    setSelectedPlanName(planName);
    setAppliedPromo(null);
    setPromoMessage('');
    setPromoMessageTone(null);
    setCheckoutError('');
    setCheckoutMessage('');
  }

  return {
    accessToken, tokenSummaryQuery, selectedPlan, appliedPromo, discount,
    promoCode, setPromoCode, promoMessage, setPromoMessage, promoMessageTone,
    setPromoMessageTone, setAppliedPromo, checkoutError, checkoutMessage,
    validatePromoMutation, checkoutMutation, selectPlan,
  };
}
