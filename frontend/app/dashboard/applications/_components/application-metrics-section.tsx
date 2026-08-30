import { ArrowUpRight, BriefcaseBusiness, Target, TrendingUp } from 'lucide-react';

import { MetricCard } from './application-ui';

type Metrics = {
  sent: number;
  responses: number;
  interviews: number;
  responseRate: number;
  variants: Array<{
    name: string;
    sent: number;
    responses: number;
    interviews: number;
    responseRate: number;
  }>;
};

export function ApplicationMetricCards({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={BriefcaseBusiness} label="Отправлено" value={metrics.sent} />
      <MetricCard icon={ArrowUpRight} label="Ответы" value={metrics.responses} />
      <MetricCard icon={Target} label="Интервью" value={metrics.interviews} />
      <MetricCard
        icon={TrendingUp}
        label="Конверсия в ответ"
        value={`${metrics.responseRate}%`}
      />
    </div>
  );
}

export function VariantMetrics({ variants }: { variants: Metrics['variants'] }) {
  if (!variants.length) return null;
  return (
    <section className="rounded-xl border border-foreground/10 bg-foreground/[0.018] p-5 sm:p-6">
      <h2 className="text-lg font-medium text-foreground">Эффективность версий</h2>
      <p className="mt-1 text-sm text-foreground/45">
        Считаем только отправленные отклики. Чем больше выборка, тем надёжнее вывод.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {variants.slice(0, 6).map((variant) => (
          <div
            key={variant.name}
            className="rounded-lg border border-foreground/10 bg-foreground/[0.025] p-4"
          >
            <p className="truncate text-sm font-medium text-foreground/85">{variant.name}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-medium tabular-nums text-foreground">
                  {variant.responseRate}%
                </p>
                <p className="mt-1 text-xs text-foreground/35">ответов</p>
              </div>
              <p className="text-right text-xs leading-5 text-foreground/45">
                {variant.responses} из {variant.sent}
                <br />
                интервью: {variant.interviews}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
