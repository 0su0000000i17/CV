// Token pricing and plan catalog.
//
// ЭКОНОМИКА (все цифры - предпосылки, меняются здесь в одном месте):
// Провайдер — Yandex AI REST; быстрый sync по умолчанию, async доступен через конфигурацию:
// Числа ниже — прежняя async-модель себестоимости. Перед изменением тарифов их нужно
// пересчитать по фактическим sync usage-метрикам; продуктовые цены этим рефакторингом не меняются.
//   * YandexGPT 5.1 Pro async  ~0.60 ₽ / 1000 LLM-токенов (prompt+completion)
//   * YandexGPT 5 Lite async   ~0.10 ₽ / 1000 LLM-токенов
// Оценка себестоимости одной операции (типично / худший случай с ретраем):
//   * analyze              ~12k Pro  ≈  7 ₽ / 10 ₽
//   * fit_check            ~10k Pro  ≈  6 ₽ /  8 ₽
//   * adaptation_questions local planner, no AI request
//   * improvement_questions local planner, no AI request
//   * adapt (fit re-check is opt-in) ~24k Pro ≈ 14 ₽ / 29 ₽
//   * improve              ~24k Pro  ≈ 14 ₽ / 29 ₽
//   * cover_letter          ~6k Pro  ≈  4 ₽ /  6 ₽
//   * vacancy_prepare       ~4k Lite ≈  1 ₽ /  2 ₽
// Полный цикл адаптации (prepare + fit + questions + adapt) ≈ 34 ₽ типично,
// ~55 ₽ в худшем случае.
//
// Курс кредита (решение продукта 2026-07-12): 1 кредит ≈ 3.5 ₽ - специально
// не 1:1, чтобы кредит не читался как рубль напрямую. Стоимости в кредитах
// ниже (UI-термин; идентификаторы в коде остаются "token*" - переименование
// только пользовательского текста) выставлены так, чтобы держать пол маржи
// ≥50% даже в худшем случае на КАЖДОЙ отдельной фиче (раньше было до 20% на
// improvement_questions) - см. расчёт под каждой строкой.
export type TokenFeature =
  | "analyze"
  | "improve"
  | "adapt"
  | "fit_check"
  | "adaptation_questions"
  | "improvement_questions"
  | "cover_letter"
  | "vacancy_prepare";

export const TOKEN_COSTS: Record<TokenFeature, number> = {
  analyze: 6, // 21 ₽, worst 10 ₽ → 52% margin
  improve: 17, // 59.5 ₽, worst 29 ₽ → 51% margin
  adapt: 20, // 70 ₽, worst 35 ₽ → 50% margin
  fit_check: 5, // 17.5 ₽, worst 8 ₽ → 54% margin
  adaptation_questions: 6, // продуктовая цена консультации; прямого LLM-вызова нет
  improvement_questions: 7, // продуктовая цена консультации; прямого LLM-вызова нет
  cover_letter: 4, // 14 ₽, worst 6 ₽ → 57% margin
  vacancy_prepare: 2, // 7 ₽, worst 2 ₽ → 71% margin
};

// Разовый бонус новому пользователю: хватает на оценку резюме (6) +
// сопроводительное письмо (4) с запасом, или на ~3 оценки резюме подряд.
// Меньше прежних 100 (было почти на весь цикл адаптации бесплатно) -
// достаточно, чтобы распробовать сервис, не раздавая цикл адаптации даром.
export const WELCOME_TOKENS = 20;

export type BillingPlanDefinition = {
  id: string;
  name: string;
  priceRub: number;
  tokens: number;
  description: string;
  featured?: boolean;
};

// Разовые пакеты кредитов (решение продукта 2026-07-12): без привязки ко
// времени - "неделя" убрана из копирайта, кредиты не сгорают, авто-списаний
// нет и не будет, продление = новая покупка (аддитивно к балансу). Все три
// пакета дают доступ к одинаковому набору функций - различаются только
// объёмом кредитов; чем больше сумма, тем выгоднее курс за кредит. Цены
// подняты на ~20% сверх маржи по AI (решение 2026-07-12) - запас под
// сервер/хостинг и эквайринг, которые в стоимости кредита не учтены:
//   Старт  179 ₽ / 40  кред ≈ 4.48 ₽/кред
//   Плюс   479 ₽ / 115 кред ≈ 4.17 ₽/кред
//   Про    899 ₽ / 220 кред ≈ 4.09 ₽/кред
export const BILLING_PLANS: BillingPlanDefinition[] = [
  {
    id: "start_week",
    name: "Старт",
    priceRub: 179,
    tokens: 40,
    description: "Для точечной подготовки к 1-2 вакансиям",
  },
  {
    id: "plus_week",
    name: "Плюс",
    priceRub: 479,
    tokens: 115,
    description: "Оптимальный тариф для активного поиска работы",
    featured: true,
  },
  {
    id: "pro_week",
    name: "Про",
    priceRub: 899,
    tokens: 220,
    description: "Для большого количества откликов и частой адаптации резюме",
  },
];

export function findBillingPlan(planId: unknown): BillingPlanDefinition | null {
  if (typeof planId !== "string") return null;
  return BILLING_PLANS.find((plan) => plan.id === planId) || null;
}
