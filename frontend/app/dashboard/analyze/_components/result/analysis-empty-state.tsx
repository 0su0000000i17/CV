import { CheckCircle2, Lightbulb } from 'lucide-react';

const previewItems = [
  'Покажем общую оценку и детализацию по профессиональной рубрике.',
  'Найдём несостыковки роли, уровня, опыта и ATS.',
  'Сформируем конкретные рекомендации для улучшения резюме.',
];

export function AnalysisEmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.018] p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/50">
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
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
