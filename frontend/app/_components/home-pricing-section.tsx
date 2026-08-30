import type { PointerEventHandler } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { HomePlanCard } from './home-plan-card';
import { homePlans } from './home-plans';
import styles from '../page.module.css';

const benefits = ['Без подписки', 'Кредиты не сгорают', 'Все функции доступны'];

export function HomePricingSection({
  billingHref,
  onPointerMove,
}: {
  billingHref: string;
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  return (
    <section id="pricing" className="scroll-mt-24 pt-28 md:pt-36">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Тарифы
          </p>
          <h2
            data-reveal
            className={`${styles.revealHeading} mt-4 max-w-2xl text-3xl font-normal tracking-[-0.035em] text-foreground sm:text-4xl`}
          >
            Платите за результат, а не за ещё одну подписку
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Выберите подходящий объём кредитов. Они не сгорают, автосписаний нет,
            а набор инструментов одинаков во всех пакетах.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
          {benefits.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-white/55" /> {item}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {homePlans.map((plan) => (
          <HomePlanCard
            key={plan.name}
            plan={plan}
            billingHref={billingHref}
            onPointerMove={onPointerMove}
          />
        ))}
      </div>
    </section>
  );
}
