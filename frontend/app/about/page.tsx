import { Target } from 'lucide-react';

import styles from '../_components/marketing-info.module.css';
import { aboutOutcomes, aboutPrinciples } from './about-content';

export default function AboutPage() {
  return (
    <div className={styles.page + ' mx-auto w-full max-w-[1028px]'}>
      <section className="mx-auto flex max-w-3xl flex-col items-center pt-4 text-center sm:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/35 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-300">
          <Target className="h-3.5 w-3.5" />
          О проекте
        </div>

        <h1 className="mt-6 text-[clamp(2.5rem,5vw,3.75rem)] font-normal leading-[0.96] tracking-[-0.05em] text-foreground">
          Карьерные инструменты,
          <span className="block text-brand-500">которые усиливают кандидата</span>
        </h1>

        <p className="mt-6 max-w-[43rem] text-base leading-7 text-muted-foreground">
          Сервис превращает резюме в понятную рабочую систему: от честной
          оценки и уточняющих вопросов до усиленной версии и точной адаптации
          под вакансию.
        </p>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {aboutPrinciples.map((principle) => {
          const Icon = principle.icon;

          return (
            <article
              key={principle.title}
              className={
                styles.card +
                ' rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6'
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-400">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <h2 className="mt-8 text-xl font-medium tracking-tight text-foreground">
                {principle.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {principle.description}
              </p>
            </article>
          );
        })}
      </section>

      <section
        className={
          styles.card +
          ' mt-4 grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center'
        }
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-400">
            Результат
          </p>
          <h2 className="mt-4 text-3xl font-normal leading-tight tracking-[-0.04em] text-foreground sm:text-4xl">
            Не шаблон, а цельное профессиональное резюме
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Языковые модели работают вместе с правилами карьерной редакции,
            поэтому итог сохраняет факты и одновременно звучит сильнее.
          </p>
        </div>

        <div className="grid gap-3">
          {aboutOutcomes.map((outcome, index) => (
            <div
              key={outcome}
              className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3.5"
            >
              <span className="mt-0.5 text-xs font-semibold tabular-nums text-brand-400">
                0{index + 1}
              </span>
              <p className="text-sm leading-6 text-foreground/85">{outcome}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
