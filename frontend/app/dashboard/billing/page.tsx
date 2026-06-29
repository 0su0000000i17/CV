import { Check, CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0 ₽',
    period: 'один раз',
    description: 'Чтобы попробовать сервис и понять, подходит ли он под ваши задачи',
    actions: '3 действия',
    badge: 'Старт',
    features: [
      'Оценка резюме',
      'Адаптация под вакансию',
      'Сопроводительное письмо',
    ],
  },
  {
    name: 'Start',
    price: '199 ₽',
    period: 'на 30 дней',
    description: 'Для точечной подготовки к нескольким вакансиям',
    actions: '15 действий',
    badge: null,
    features: [
      'Все основные инструменты',
      'Работа с несколькими вакансиями',
      'Сохранение результата в кабинете',
    ],
  },
  {
    name: 'Plus',
    price: '499 ₽',
    period: 'на 30 дней',
    description: 'Оптимальный тариф для активного поиска работы',
    actions: '50 действий',
    badge: 'Оптимальный',
    featured: true,
    features: [
      'Оценка и улучшение резюме',
      'Адаптация под разные вакансии',
      'Генерация сопроводительных писем',
    ],
  },
  {
    name: 'Pro',
    price: '899 ₽',
    period: 'на 30 дней',
    description: 'Для большого количества откликов и частой адаптации резюме',
    actions: '120 действий',
    badge: 'Больше лимит',
    features: [
      'Максимальный лимит действий',
      'Подходит для активных откликов',
      'Все возможности CVPro',
    ],
  },
];

const securityItems = [
  {
    title: 'Безопасная оплата',
    description: 'Оплата проходит через защищённую платёжную страницу Яндекса',
    icon: ShieldCheck,
  },
  {
    title: 'Без хранения карт',
    description: 'Мы не храним данные банковских карт',
    icon: LockKeyhole,
  },
];

export default function Page() {
  return (
    <div>
      <div className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Личный кабинет / Оплата
        </p>

        <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
          Оплата
        </h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Выберите тариф для работы с резюме, адаптациями и сопроводительными
          письмами: одно действие — это оценка резюме, адаптация под вакансию
          или генерация сопроводительного письма
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex min-h-full flex-col rounded-2xl border p-5 ${
              plan.featured
                ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20'
                : 'border-border bg-card/60'
            }`}
          >
            {plan.badge ? (
              <span
                className={`mb-5 w-fit rounded-full border px-3 py-1 text-xs ${
                  plan.featured
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {plan.badge}
              </span>
            ) : (
              <div className="mb-5 h-7" />
            )}

            <div
              className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${
                plan.featured
                  ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-300 ring-blue-500/20'
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </div>

            <h2 className="text-2xl font-medium text-foreground">{plan.name}</h2>

            <div className="mt-4">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {plan.price}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                {plan.period}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:min-h-[72px]">
              {plan.description}
            </p>

            <div className="mt-5 rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-sm text-muted-foreground">Лимит</p>
              <p className="mt-1 text-lg font-medium text-foreground">
                {plan.actions}
              </p>
            </div>

            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      plan.featured ? 'text-emerald-300' : 'text-blue-300'
                    }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled
                className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-70 ${
                  plan.featured
                    ? 'bg-foreground text-background'
                    : 'border border-border text-foreground'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Выбрать тариф
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        {securityItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-card/60 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-medium text-foreground">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
