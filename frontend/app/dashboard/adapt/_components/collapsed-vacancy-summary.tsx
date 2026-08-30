import { Briefcase, ChevronDown } from 'lucide-react';

function getInputPreview(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Можно раскрыть блок и вставить новую ссылку или текст вакансии.';
  return trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed;
}

export function CollapsedVacancySummary({
  isExpanded,
  vacancyInput,
  onToggle,
}: {
  isExpanded: boolean;
  vacancyInput: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="w-full cursor-pointer p-5 text-left transition-colors hover:bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-medium text-foreground">Вакансия уже проверена</h2>
              <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-xs text-brand-300">
                можно создать без повторной проверки
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {isExpanded
                ? 'Можно изменить вакансию, но тогда потребуется новая проверка.'
                : 'Нажмите “Создать адаптацию”, чтобы сгенерировать снова без валидации и проверки совместимости.'}
            </p>
            {!isExpanded ? (
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {getInputPreview(vacancyInput)}
              </p>
            ) : null}
          </div>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
    </button>
  );
}
