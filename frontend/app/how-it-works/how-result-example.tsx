import styles from '../_components/marketing-info.module.css';
import { howMetrics } from './how-content';

export function HowResultExample() {
  return (
    <section className={`${styles.card} mt-4 grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 sm:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center`}>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-400">Пример результата</p>
        <div className="mt-4 flex items-end gap-2">
          <span className="text-6xl font-medium tracking-[-0.06em] text-foreground">87</span>
          <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
          Не просто оценка — видно, какие стороны резюме уже работают и что стоит усилить перед следующим откликом.
        </p>
      </div>
      <div className="space-y-5">
        {howMetrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-foreground/85">{metric.label}</span>
              <span className="text-brand-400">{metric.value}</span>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-brand-500" style={{ width: metric.progress }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
