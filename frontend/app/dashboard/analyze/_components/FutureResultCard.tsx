import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react';

import type {
  ResumeAnalysisResult,
  ResumeRedFlag,
} from '@/src/shared/api/analyze';

type Props = {
  analysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
  isError: boolean;
  errorMessage?: string;
};

const redFlagLabels: Record<string, string> = {
  role_mismatch: 'Несоответствие роли',
  inflated_level: 'Завышенный уровень',
  career_transition: 'Переходная траектория',
  weak_evidence: 'Слабая доказательность',
  generic_responsibilities: 'Общие обязанности',
  keyword_stuffing: 'Перегруз навыками',
  poor_ats: 'ATS-проблемы',
  unclear_positioning: 'Неясное позиционирование',
  missing_metrics: 'Мало метрик',
  low_scanability: 'Слабый быстрый HR-скан',
  overlong_resume: 'Перегруженное резюме',
  inconsistent_titles: 'Несостыковка должностей',
};

const severityLabels: Record<ResumeRedFlag['severity'], string> = {
  minor: 'Низкий риск',
  major: 'Средний риск',
  critical: 'Критичный риск',
};

function ResultSection({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-foreground" />
        </div>

        <h3 className="text-lg font-medium text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-3">
            <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
              {index + 1}
            </span>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RedFlagsBlock({ redFlags }: { redFlags: ResumeRedFlag[] }) {
  if (!redFlags.length) {
    return null;
  }

  return (
    <div className="mb-5 rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2">
          <TriangleAlert className="h-4 w-4 text-foreground" />
        </div>

        <h3 className="font-medium text-foreground">Почему такая оценка</h3>
      </div>

      <div className="space-y-3">
        {redFlags.map((flag) => (
          <div
            key={`${flag.type}-${flag.explanation}`}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {redFlagLabels[flag.type] || flag.type}
              </span>

              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                {severityLabels[flag.severity]}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {flag.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FutureResultCard({
  analysis,
  isAnalyzing,
  isError,
  errorMessage,
}: Props) {
  if (isAnalyzing) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-muted p-3">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground">
              Анализируем резюме
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Извлекаем текст, определяем red flags и считаем итоговую оценку по
              backend-рубрике.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-muted p-3">
            <AlertCircle className="h-5 w-5 text-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground">
              Не удалось выполнить оценку
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {errorMessage ||
                'Попробуйте запустить анализ ещё раз. Если ошибка повторится, проверим backend-логи.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-xl bg-muted p-3">
            <Lightbulb className="h-5 w-5 text-foreground" />
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
          {[
            'Покажем общую оценку и детализацию по профессиональной рубрике.',
            'Найдём несостыковки роли, уровня, опыта и ATS.',
            'Сформируем конкретные рекомендации для улучшения резюме.',
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <Sparkles className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Результат оценки
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {analysis.suggestedHeadline}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-border bg-background p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {analysis.summary}
        </p>
      </div>

      <RedFlagsBlock redFlags={analysis.redFlags} />

      <div className="rounded-2xl border border-border bg-background p-5">
        <ResultSection
          title="Сильные стороны"
          items={analysis.strengths}
          icon={CheckCircle2}
        />

        <ResultSection
          title="Что мешает"
          items={analysis.weaknesses}
          icon={ShieldAlert}
        />

        <ResultSection
          title="ATS-проблемы"
          items={analysis.atsIssues}
          icon={Search}
        />

        <ResultSection
          title="Рекомендации"
          items={analysis.recommendations}
          icon={Target}
        />
      </div>

      {analysis.missingKeywords.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-5">
          <h3 className="font-medium text-foreground">
            Недостающие ключевые слова
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}