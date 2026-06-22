'use client';

import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Loader2,
  RotateCw,
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

function getSectionRows(analysis?: ResumeAnalysisResult): SectionRow[] {
  return [
    {
      key: 'positioning',
      title: 'Позиционирование',
      score: analysis?.sections.positioning ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Насколько понятно резюме продаёт кандидата под конкретную роль: кто он, на какую позицию претендует и не размыт ли фокус.',
    },
    {
      key: 'roleFit',
      title: 'Соответствие роли',
      score: analysis?.sections.roleFit ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Показывает, подтверждают ли последние должности, задачи и опыт заявленную роль и уровень. Например, Middle-разработчик должен быть подкреплён реальным developer/engineer-опытом.',
    },
    {
      key: 'experience',
      title: 'Релевантный опыт',
      score: analysis?.sections.experience ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Оценивает, насколько опыт кандидата связан с целевой позицией: есть ли production-задачи, подходящий стек, карьерная линия и достаточная глубина опыта.',
    },
    {
      key: 'evidence',
      title: 'Доказательность',
      score: analysis?.sections.evidence ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Показывает, насколько резюме доказывает ценность кандидата: есть ли результаты, метрики, масштаб задач, влияние на продукт или бизнес, а не только список обязанностей.',
    },
    {
      key: 'scanability',
      title: 'Быстрый HR-скан',
      score: analysis?.sections.scanability ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Показывает, насколько быстро рекрутер может понять резюме при первом беглом просмотре: роль, уровень, последний релевантный опыт и ключевая ценность кандидата.',
    },
    {
      key: 'ats',
      title: 'ATS',
      score: analysis?.sections.ats ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Оценивает пригодность резюме для автоматического отбора: стандартные секции, понятные должности, релевантные ключевые слова и отсутствие форматирования, которое мешает парсингу.',
    },
    {
      key: 'credibility',
      title: 'Доверие',
      score: analysis?.sections.credibility ?? 0,
      status: analysis ? 'Проверено' : 'Ожидает проверки',
      description:
        'Показывает, нет ли риск-факторов: завышенного уровня, несостыковки должностей, перегруза навыками, слабой доказательности или ощущения, что резюме выглядит неправдоподобно.',
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
    return 'text-foreground';
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

  const scoreLabel = analysis ? analysis.score : '—';
  const sectionRows = getSectionRows(analysis);

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
              analysis ? getScoreTextClass(analysis.score) : 'text-foreground'
            }`}
          >
            {scoreLabel}
          </span>

          <span className="pb-3 text-muted-foreground">/100</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {analysis
            ? 'Оценка рассчитана backend-рубрикой по роли, опыту, доказательности, быстрому HR-скану, ATS и red flags.'
            : 'Оценка появится после запуска анализа. Сейчас резюме ещё не проверялось.'}
        </p>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!selectedResume || isAnalyzing}
          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Оцениваем...
            </>
          ) : analysis ? (
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

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleMetric(item.key)}
                aria-expanded={isOpened}
                className="w-full cursor-pointer rounded-xl border border-transparent px-3 py-2 text-left transition-colors duration-150 hover:border-border hover:bg-muted/40"
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{item.title}</span>

                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                        isOpened ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  <span
                    className={
                      analysis
                        ? getScoreTextClass(item.score)
                        : 'text-muted-foreground'
                    }
                  >
                    {analysis ? `${item.score}/100` : '—'}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      analysis ? getScoreBarClass(item.score) : 'bg-foreground'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.status}
                </p>

                {isOpened && (
                  <div className="mt-3 rounded-lg border border-border bg-background/70 px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
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

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />

          <div>
            <h2 className="font-medium text-foreground">Важно</h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Повторная оценка не означает, что резюме каждый раз заново
              отправляется в AI. Если файл не менялся, backend может быстро
              вернуть сохранённый результат.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}