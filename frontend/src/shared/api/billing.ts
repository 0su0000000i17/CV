import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type PromoCodeValidationResponse = {
  promoCode: {
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    startsAt: string | null;
    expiresAt: string | null;
  };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
};

export async function validateBillingPromoCode({
  code,
  amount,
  accessToken,
}: {
  code: string;
  amount: number;
  accessToken: string;
}) {
  const response = await fetch(`${getApiUrl()}/api/billing/promo-code/validate`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, amount }),
  });

  return parseApiResponse<PromoCodeValidationResponse>(
    response,
    'Не удалось применить промокод'
  );
}

type BillingPlanFromApi = {
  id: string;
  name: string;
  priceRub: number;
  tokens: number;
  description: string;
  featured?: boolean;
};

export type TokenSummaryResponse = {
  balance: number;
  // Marketing label from the most recent SUCCEEDED payment's plan name -
  // there is no ongoing subscription tier in the token-pack model, so this
  // is null (render as "Free") until the user completes a first purchase.
  currentPlan: string | null;
  welcomeTokens: number;
  costs: Record<string, number>;
  plans: BillingPlanFromApi[];
};

export async function getTokenSummary(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/billing/tokens`, {
    headers: createAuthHeaders(accessToken),
  });

  return parseApiResponse<TokenSummaryResponse>(response, 'Не удалось получить баланс токенов');
}

export type CheckoutResponse = {
  payment: {
    id: string;
    plan_id: string;
    amount_rub: number;
    tokens: number;
    status: string;
    created_at: string;
  };
};

export async function createBillingCheckout({
  planId,
  promoCode,
  accessToken,
}: {
  planId: string;
  promoCode?: string;
  accessToken: string;
}) {
  const response = await fetch(`${getApiUrl()}/api/billing/checkout`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId, promoCode }),
  });

  return parseApiResponse<CheckoutResponse>(response, 'Не удалось создать счёт на оплату');
}
