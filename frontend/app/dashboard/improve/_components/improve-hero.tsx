import { Wand2 } from 'lucide-react';

import styles from '../improve.module.css';

const steps = [
  ['01', 'Уточним детали'],
  ['02', 'Улучшим текст'],
  ['03', 'Проверим результат'],
] as const;

export function ImproveHero() {
  return (
    <section className={`${styles.hero} rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8`}>
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.17em] text-white/35">
          <Wand2 className="h-3.5 w-3.5" strokeWidth={1.7} />
          ИИ-инструмент
        </div>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
          Улучшение резюме
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
          Усилим формулировки, навыки и достижения, сохранив ваш реальный опыт
          и привычный формат российского рынка.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {steps.map(([number, label]) => (
            <span key={number} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/45">
              <span className="text-white/70">{number}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
