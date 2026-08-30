import styles from '../_components/marketing-info.module.css';
import { howSteps } from './how-content';

export function HowStepsGrid() {
  return (
    <section className="mt-16 grid gap-4 md:grid-cols-2">
      {howSteps.map((step) => {
        const Icon = step.icon;
        return (
          <article key={step.number} className={`${styles.card} group relative min-h-64 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 sm:p-7`}>
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-semibold tabular-nums tracking-[0.16em] text-brand-400">{step.number}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-1">
                <Icon className="h-5 w-5" strokeWidth={1.65} />
              </div>
            </div>
            <div className="mt-16 max-w-md">
              <h2 className="text-xl font-medium tracking-tight text-foreground">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
