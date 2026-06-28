import {
  Check,
  CreditCard,
  ExternalLink,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const includedFeatures = [
  'Адаптация резюме под конкретную вакансию',
  'Оценка резюме и рекомендации по улучшению',
  'Генерация сопроводительного письма',
  'Сохранение истории и работа из личного кабинета',
];

const safetyItems = [
  {
    title: 'Карты не проходят через CVPro',
    description:
      'Мы не будем собирать, показывать или хранить данные банковских карт в проекте.',
    icon: LockKeyhole,
  },
  {
    title: 'Оплата через Яндекс',
    description:
      'После подключения кнопка будет вести на защищённую платёжную страницу эквайринга.',
    icon: ShieldCheck,
  },
  {
    title: 'Проверка на backend',
    description:
      'Доступ будет выдаваться только после серверной проверки статуса платежа.',
    icon: ReceiptText,
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
          Здесь будет подключение тарифа через эквайринг Яндекса. Пока страница
          работает как интерфейс-заготовка: без ввода карты, без списаний и без
          реальных платёжных запросов.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                <Sparkles className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Тариф
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
                CVPro Pro
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Платный тариф для полноценной работы с резюме: оценка,
                адаптация под вакансии и сопроводительные письма без ручной
                переработки каждого файла.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5 lg:w-[260px]">
              <p className="text-sm text-muted-foreground">Стоимость</p>

              <p className="mt-2 text-2xl font-semibold text-foreground">
                Укажем завтра
              </p>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Цена и период тарифа будут заведены при подключении Яндекс
                Эквайринга.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {includedFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                  <Check className="h-3.5 w-3.5" />
                </span>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              Перейти к оплате
            </button>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Кнопка станет активной после подключения backend-метода создания
              платежа.
            </p>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Безопасная схема
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Платёжные данные должны оставаться на стороне платёжного
                  провайдера. В CVPro будет храниться только статус оплаты и
                  параметры подписки.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card/60 p-5">
            <h2 className="text-lg font-medium text-foreground">
              Что подключим завтра
            </h2>

            <div className="mt-4 space-y-3">
              {[
                'backend endpoint для создания платежа',
                'redirect на платёжную страницу Яндекса',
                'webhook или проверку статуса платежа',
                'обновление тарифа пользователя после успешной оплаты',
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl font-medium text-foreground">
          На что смотрим по безопасности
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {safetyItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="font-medium text-foreground">{item.title}</h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-background p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Интеграция ещё не активна
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Сейчас это только UI. Реальные платежи не создаются, карта нигде
              не вводится, доступы не меняются.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
            <ExternalLink className="h-3.5 w-3.5" />
            Яндекс Эквайринг подключим отдельно
          </div>
        </div>
      </section>
    </div>
  );
}
