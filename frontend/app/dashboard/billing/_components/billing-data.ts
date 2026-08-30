export type BillingPlan = {
  // Must match backend BILLING_PLANS ids (backend/src/billing/plans.ts) -
  // checkout re-validates plan and price server-side, these cards are display
  // only. All paid packs unlock the same features - they differ only in
  // credit volume (and rate: bigger pack = cheaper per credit).
  id: string | null;
  name: string;
  priceRub: number;
  tokens: number;
  description: string;
  badge: string | null;
  featured?: boolean;
  isSelectable: boolean;
};

export const plans: BillingPlan[] = [
  {
    id: null,
    name: 'Free',
    priceRub: 0,
    tokens: 20,
    description: 'Чтобы попробовать сервис и понять, подходит ли он под ваши задачи',
    badge: null,
    isSelectable: false,
  },
  {
    id: 'start_week',
    name: 'Старт',
    priceRub: 179,
    tokens: 40,
    description: 'Для точечной подготовки к 1-2 вакансиям',
    badge: null,
    isSelectable: true,
  },
  {
    id: 'plus_week',
    name: 'Плюс',
    priceRub: 479,
    tokens: 115,
    description: 'Оптимальный тариф для активного поиска работы',
    badge: null,
    isSelectable: true,
  },
  {
    id: 'pro_week',
    name: 'Про',
    priceRub: 899,
    tokens: 220,
    description: 'Для большого количества откликов и частой адаптации резюме',
    badge: 'Оптимальный',
    featured: true,
    isSelectable: true,
  },
];
