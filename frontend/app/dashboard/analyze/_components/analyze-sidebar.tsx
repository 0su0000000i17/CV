'use client';

import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  RotateCw,
  Sparkles,
} from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';
import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  selectedResume?: UploadedResume;
  analysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
  onAnalyze: () => void;
};

type SectionRow = {
  key: string;
  title: string;
  score: number;
  status: string;
  description: string;
};

function getStatusLabel(params: {
  hasAnalysis: boolean;
  isAnalyzing: boolean;
}) {
  if (params.isAnalyzing) {
    return 'Идёт проверка';
  }

  return params.hasAnalysis ? 'Проверено' : 'Ожидает проверки';
}

function getSectionRows(
  analysis: ResumeAnalysisResult | undefined,
  isAnalyzing: boolean
): SectionRow[] {
  const hasAnalysis = Boolean(analysis);
  const status = getStatusLabel({ hasAnalysis, isAnalyzing });

  return [
    {
      key: 'positioning',
      title: 'Позиционирование',
      score: analysis?.sections.positioning ?? 0,
      status,
      description:
        'Насколько понятно резюме показывает кандидата под конкретную роль: кто он, на какую позицию претендует и не размыт ли фокус.',
    },
    {
      key: 'roleFit',
      title: 'Соответствие роли',
      score: analysis?.sections.roleFit ?? 0,
      status,
      description:
        'Показывает, подтверждают ли последние должности, задачи и опыт заявленную роль и уровень.',
    },
    {
      key: 'experience',
      title: 'Релевантный опыт',
      score: analysis?.sections.experience ?? 0,
      status,
      description:
        'Оценивает, насколько опыт кандидата связан с целевой позицией: production-задачи, подходящий стек, карьерная линия и глубина опыта.',
    },
    {
      key: 'evidence',
      title: 'Доказательность',
      score: analysis?.sections.evidence ?? 0,
      status,
      description:
        'Показывает, насколько резюме доказывает ценность кандидата: результаты, метрики, масштаб задач и влияние на продукт.',
    },
    {
      key: 'scanability',
      title: 'Профиль резюме',
      score: analysis?.sections.scanability ?? 0,
      status,
      description:
        'Показывает, достаточно ли понятно раскрыт опыт: не слишком кратко, не перегруженно, с нужными деталями по задачам, стеку и результатам.',
    },
    {
      key: 'ats',
      title: 'ATS',
      score: analysis?.sections.ats ?? 0,
      status,
      description:
        'Оценивает пригодность резюме для автоматического отбора: стандартные секции, понятные должности, ключевые слова и парсинг.',
    },
    {
      key: 'credibility',
      title: 'Риск-факторы',
      score: analysis?.sections.credibility ?? 0,
      status,
      description:
        'Показывает, нет ли завышенного уровня, несостыковки должностей, перегруза навыками или слабой доказательности.',
    },
  ];
}

function getScoreBarClass(score: number) {
  if (score >= 80) {
    return 'bg-emerald-500';
  }

  if (score >= 60) {
    return 'bg-amber-500';
  }

  return 'bg-red-500';
}

function getScoreTextClass(score?: number) {
  if (typeof score !== 'number') {
    return 'text-muted-foreground';
  }

  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-amber-400';
  }

  return 'text-red-400';
}

export function AnalyzeSidebar({
  selectedResume,
  analysis,
  isAnalyzing,
  onAnalyze,
}: Props) {
  const [openedMetricKey, setOpenedMetricKey] = useState<string | null>(null);

  const displayAnalysis = isAnalyzing ? undefined : analysis;
  const hasAnalysis = Boolean(displayAnalysis);
  const scoreLabel = displayAnalysis ? displayAnalysis.score : '—';
  const sectionRows = getSectionRows(displayAnalysis, isAnalyzing);

  function toggleMetric(metricKey: string) {
    setOpenedMetricKey((currentKey) =>
      currentKey === metricKey ? null : metricKey
    );
  }

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <p className="text-sm text-muted-foreground">Итоговая оценка</p>

        <div className="mt-5 flex items-end gap-2">
          <span
            className={`text-6xl font-semibold ${
              displayAnalysis
                ? getScoreTextClass(displayAnalysis.score)
                : 'text-muted-foreground'
            }`}
          >
            {scoreLabel}
          </span>

          <span className="pb-3 text-muted-foreground">/100</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {isAnalyzing
            ? 'Итоговая оценка появится после завершения анализа.'
            : displayAnalysis
              ? 'Оценка рассчитана по роли, опыту, доказательности, профилю резюме, ATS и риск-факторам.'
              : 'Оценка появится после запуска анализа.'}
        </p>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!selectedResume || isAnalyzing}
          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Оценка идёт...
            </>
          ) : displayAnalysis ? (
            <>
              Повторить оценку
              <RotateCw className="h-4 w-4" />
            </>
          ) : (
            <>
              Запустить оценку
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl font-medium text-foreground">Детализация</h2>

        <div className="mt-5 space-y-2">
          {sectionRows.map((item) => {
            const isOpened = openedMetricKey === item.key;
            const scoreWidth = hasAnalysis ? item.score : 0;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleMetric(item.key)}
                aria-expanded={isOpened}
                className="w-full cursor-pointer rounded-xl border border-transparent px-3 py-2 text-left transition-colors duration-150 hover:border-border hover:bg-muted/40"
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-foreground">
                      {item.title}
                    </span>

                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpened ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  <span
                    className={
                      hasAnalysis
                        ? getScoreTextClass(item.score)
                        : 'text-muted-foreground'
                    }
                  >
                    {hasAnalysis ? `${item.score}/100` : '—'}
                  </span>
                </div>

                <div className="h-1 rounded-full bg-muted">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      hasAnalysis
                        ? getScoreBarClass(item.score)
                        : 'bg-muted-foreground/20'
                    }`}
                    style={{ width: `${scoreWidth}%` }}
                  />
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  {item.status}
                </p>

                {isOpened && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-1 rounded-lg border border-border bg-background/70 px-3 py-2 duration-150">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
