import { Mail } from 'lucide-react';

export function CoverLetterHeader() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.17em] text-white/35">
          <Mail className="h-3.5 w-3.5" strokeWidth={1.7} />
          Персональный отклик
        </div>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
          Сопроводительное письмо
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
          Короткое письмо под конкретную вакансию — на основе реального опыта,
          без шаблонных фраз и выдуманных достижений.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {['Резюме', 'Вакансия', 'Тон', 'Готовый текст'].map((item, index) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/45"
            >
              <span className="text-white/70">0{index + 1}</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
