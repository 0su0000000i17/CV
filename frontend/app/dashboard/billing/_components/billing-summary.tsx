import { Coins, CreditCard } from 'lucide-react';

import { RollingNumber } from '@/src/shared/ui/rolling-number';

function pluralizeCredits(amount: number) {
  const mod10 = amount % 10;
  const mod100 = amount % 100;
  if (mod10 === 1 && mod100 !== 11) return 'кредит';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'кредита';
  return 'кредитов';
}

function costLabel(costs: Record<string, number> | undefined, feature: string, fallback: number) {
  const amount = costs?.[feature] ?? fallback;
  return `${amount} ${pluralizeCredits(amount)}`;
}

export function BillingSummary({ balance, costs }: {
  balance: number;
  costs?: Record<string, number>;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.17em] text-white/35">
            <CreditCard className="h-3.5 w-3.5" strokeWidth={1.7} /> Кредиты сервиса
          </div>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
            Пополнение баланса
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
            Выберите нужный объём. Кредиты не сгорают, подписки и автосписаний нет.
          </p>
        </div>
        <div className="flex min-w-52 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-white/55">
            <Coins className="h-4 w-4" />
          </span>
          <div><p className="text-xs text-white/30">Текущий баланс</p>
            <p className="mt-0.5 text-xl font-medium text-white"><RollingNumber value={balance} />
              <span className="ml-1 text-xs font-normal text-white/35">кредитов</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/35">
        <span className="rounded-full border border-white/[0.08] px-3 py-1.5">Оценка — {costLabel(costs, 'analyze', 6)}</span>
        <span className="rounded-full border border-white/[0.08] px-3 py-1.5">Улучшение — {costLabel(costs, 'improve', 17)}</span>
        <span className="rounded-full border border-white/[0.08] px-3 py-1.5">Адаптация — {costLabel(costs, 'adapt', 20)}</span>
        <span className="rounded-full border border-white/[0.08] px-3 py-1.5">Письмо — {costLabel(costs, 'cover_letter', 4)}</span>
      </div>
    </section>
  );
}
