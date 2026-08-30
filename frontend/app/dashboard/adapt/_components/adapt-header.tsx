import { Target } from 'lucide-react';

export function AdaptHeader() {
  return (
    <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.17em] text-white/35">
          <Target className="h-3.5 w-3.5" strokeWidth={1.7} />
          Точная подача
        </div>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
          Адаптация под вакансию
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
          Сопоставим требования с вашим опытом и усилим релевантность без
          выдуманных навыков, ролей и достижений.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ['01', 'Резюме'],
            ['02', 'Вакансия'],
            ['03', 'Совместимость'],
            ['04', 'Адаптация'],
          ].map(([number, label]) => (
            <span
              key={number}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/45"
            >
              <span className="text-white/70">{number}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
