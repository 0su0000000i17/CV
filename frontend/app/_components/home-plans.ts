export type HomePlan = {
  name: string;
  price: string;
  credits: string;
  description: string;
  details: string[];
  cta: string;
  badge?: string;
  highlighted?: boolean;
};

// Marketing preview only. Billing plans and purchase logic stay unchanged.
export const homePlans: HomePlan[] = [
  {
    name: 'Free',
    price: '0 ₽',
    credits: '20 кредитов',
    description: 'Чтобы спокойно попробовать сервис на своём резюме.',
    details: ['Основные ИИ-инструменты', 'Без карты и подписки', 'Стартовый баланс сразу'],
    cta: 'Начать бесплатно',
  },
  {
    name: 'Старт',
    price: '179 ₽',
    credits: '40 кредитов',
    description: 'Для точечной подготовки к одной или двум вакансиям.',
    details: ['Кредиты не сгорают', 'Все возможности сервиса', '≈ 4,48 ₽ за кредит'],
    cta: 'Выбрать Старт',
  },
  {
    name: 'Плюс',
    price: '479 ₽',
    credits: '115 кредитов',
    description: 'Оптимальный объём для активного поиска работы.',
    details: ['Кредиты не сгорают', 'Все возможности сервиса', '≈ 4,17 ₽ за кредит'],
    cta: 'Выбрать Плюс',
    badge: 'Чаще выбирают',
    highlighted: true,
  },
  {
    name: 'Про',
    price: '899 ₽',
    credits: '220 кредитов',
    description: 'Для частых адаптаций и большого количества откликов.',
    details: ['Кредиты не сгорают', 'Все возможности сервиса', '≈ 4,09 ₽ за кредит'],
    cta: 'Выбрать Про',
    badge: 'Выгоднее за кредит',
  },
];
