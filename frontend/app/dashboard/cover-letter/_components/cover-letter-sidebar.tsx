import { Check, ShieldCheck } from 'lucide-react';

const steps = [
  'Берём только профессиональный контекст',
  'Сопоставляем его с вакансией',
  'Пишем коротко и без выдуманных фактов',
];

export function CoverLetterSidebar() {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.018] p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/30">
            Честная генерация
          </p>
          <h2 className="mt-1 text-base font-medium text-white">
            Как работаем
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div key={step} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45" />
            <p className="text-xs leading-5 text-white/38">{step}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-white/[0.08] pt-4 text-xs leading-5 text-white/30">
        Контакты не отправляются в ИИ и добавляются отдельно после генерации.
      </p>
    </aside>
  );
}
