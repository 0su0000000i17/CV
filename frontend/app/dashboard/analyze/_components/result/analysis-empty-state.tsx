import { CheckCircle2, Lightbulb } from 'lucide-react';

const previewItems = [
  'Покажем общую оценку и детализацию по профессиональной рубрике.',
  'Найдём несостыковки роли, уровня, опыта и ATS.',
  'Сформируем конкретные рекомендации для улучшения резюме.',
];

export function AnalysisEmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
          <Lightbulb className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Что появится после оценки
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            После запуска анализа здесь появятся сильные стороны, слабые места
            и конкретные рекомендации.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {previewItems.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
