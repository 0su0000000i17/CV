'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Lightbulb,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

type LoadingStep = {
  title: string;
  description: string;
};

const STEP_DURATION_MS = 6_000;
const LONG_WAIT_STEP_DURATION_MS = 12_000;
const accentIconClassName = 'bg-blue-500/10 text-blue-300 ring-blue-500/20';

const analysisSteps: LoadingStep[] = [
  {
    title: 'Считаем позиционирование',
    description:
      'Проверяем, насколько понятно резюме показывает роль, фокус и ценность кандидата.',
  },
  {
    title: 'Проверяем соответствие роли',
    description:
      'Смотрим, подтверждают ли опыт, последние должности и стек заявленную позицию.',
  },
  {
    title: 'Оцениваем релевантный опыт',
    description:
      'Разбираем production-задачи, карьерную линию, стек и глубину опыта.',
  },
  {
    title: 'Проверяем доказательность',
    description:
      'Ищем метрики, результаты, масштаб задач и конкретное влияние на продукт.',
  },
  {
    title: 'Делаем быстрый HR-скан',
    description:
      'Оцениваем, насколько быстро рекрутер поймёт роль, уровень и сильные стороны.',
  },
  {
    title: 'Проверяем ATS-фильтры',
    description:
      'Смотрим структуру, ключевые слова и потенциальные проблемы автоматического отбора.',
  },
  {
    title: 'Оцениваем риск-факторы',
    description:
      'Проверяем завышенный уровень, несостыковки, перегруз навыками и слабые места.',
  },
  {
    title: 'Собираем итоговую оценку',
    description:
      'Структурируем вывод, рекомендации и детализацию по профессиональной рубрике.',
  },
];

const longWaitSteps: LoadingStep[] = [
  {
    title: 'Ещё немного',
    description:
      'Финализируем результат и приводим рекомендации к понятному формату.',
  },
  {
    title: 'Проверяем итоговую структуру',
    description:
      'Сверяем сильные стороны, слабые места, ATS-проблемы и риск-факторы.',
  },
  {
    title: 'Почти готово',
    description:
      'Собираем финальный отчёт и подготавливаем результат к отображению.',
  },
];

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

const severityClasses: Record<ResumeRedFlag['severity'], string> = {
  minor: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  major: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
};

const sectionIconClasses = {
  yellow: accentIconClassName,
  green: accentIconClassName,
  orange: accentIconClassName,
  red: accentIconClassName,
};

function getActiveLoadingStep(elapsedMs: number) {
  const baseDurationMs = analysisSteps.length * STEP_DURATION_MS;

  if (elapsedMs < baseDurationMs) {
    const stepIndex = Math.min(
      analysisSteps.length - 1,
      Math.floor(elapsedMs / STEP_DURATION_MS)
    );

    return analysisSteps[stepIndex];
  }

  const longWaitIndex = Math.min(
    longWaitSteps.length - 1,
    Math.floor((elapsedMs - baseDurationMs) / LONG_WAIT_STEP_DURATION_MS)
  );

  return longWaitSteps[longWaitIndex];
}

function ResultSection({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone: keyof typeof sectionIconClasses;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${sectionIconClasses[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <h3 className="text-lg font-medium text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
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
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
          <TriangleAlert className="h-4 w-4" />
        </div>

        <h3 className="text-lg font-medium text-foreground">
          Почему такая оценка
        </h3>
      </div>

      <div className="divide-y divide-border">
        {redFlags.map((flag) => (
          <div
            key={`${flag.type}-${flag.explanation}`}
            className="py-4 first:pt-0 last:pb-0"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {redFlagLabels[flag.type] || flag.type}
              </span>

              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] ${severityClasses[flag.severity]}`}
              >
                {severityLabels[flag.severity]}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {flag.explanation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalysisLoadingState() {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeStep = useMemo(() => getActiveLoadingStep(elapsedMs), [elapsedMs]);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-medium text-foreground">
            Анализируем резюме
          </h2>

          <div
            key={activeStep.title}
            className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Сейчас
            </p>

            <h3 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
              {activeStep.title}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {activeStep.description}
            </p>
          </div>

          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Время анализа зависит от размера файла, структуры резюме и скорости
            ответа AI-модели. Результат появится автоматически.
          </p>
        </div>
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
    return <AnalysisLoadingState />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
            <AlertCircle className="h-5 w-5" />
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
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
          {[
            'Покажем общую оценку и детализацию по профессиональной рубрике.',
            'Найдём несостыковки роли, уровня, опыта и ATS.',
            'Сформируем конкретные рекомендации для улучшения резюме.',
          ].map((item) => (
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

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
            <Sparkles className="h-5 w-5" />
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

        <p className="text-sm leading-relaxed text-muted-foreground">
          {analysis.summary}
        </p>
      </section>

      <RedFlagsBlock redFlags={analysis.redFlags} />

      <ResultSection
        title="Сильные стороны"
        items={analysis.strengths}
        icon={CheckCircle2}
        tone="green"
      />

      <ResultSection
        title="Что мешает"
        items={analysis.weaknesses}
        icon={ShieldAlert}
        tone="orange"
      />

      <ResultSection
        title="ATS-проблемы"
        items={analysis.atsIssues}
        icon={FileSearch}
        tone="yellow"
      />

      <ResultSection
        title="Рекомендации"
        items={analysis.recommendations}
        icon={Target}
        tone="green"
      />

      {analysis.missingKeywords.length > 0 && (
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
              <Search className="h-4 w-4" />
            </div>

            <h3 className="text-lg font-medium text-foreground">
              Недостающие ключевые слова
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
