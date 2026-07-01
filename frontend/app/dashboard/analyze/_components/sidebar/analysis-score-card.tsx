import { ArrowRight, RotateCw, Sparkles } from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';
import type { UploadedResume } from '@/src/shared/api/resumes';

import { getScoreTextClass } from './score-styles';

type Props = {
  selectedResume?: UploadedResume;
  displayAnalysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
  onAnalyze: () => void;
};

export function AnalysisScoreCard({
  selectedResume,
  displayAnalysis,
  isAnalyzing,
  onAnalyze,
}: Props) {
  const scoreLabel = displayAnalysis ? displayAnalysis.score : '—';

  return (
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
        {getScoreDescription({ displayAnalysis, isAnalyzing })}
      </p>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!selectedResume || isAnalyzing}
        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {getButtonContent({ displayAnalysis, isAnalyzing })}
      </button>
    </div>
  );
}

function getScoreDescription(params: {
  displayAnalysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
}) {
  if (params.isAnalyzing) {
    return 'Итоговая оценка появится после завершения анализа.';
  }

  if (params.displayAnalysis) {
    return 'Оценка рассчитана по роли, опыту, доказательности, профилю резюме, ATS и риск-факторам.';
  }

  return 'Оценка появится после запуска анализа.';
}

function getButtonContent(params: {
  displayAnalysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
}) {
  if (params.isAnalyzing) {
    return (
      <>
        <Sparkles className="h-4 w-4 animate-pulse" />
        Оценка идёт...
      </>
    );
  }

  if (params.displayAnalysis) {
    return (
      <>
        Повторить оценку
        <RotateCw className="h-4 w-4" />
      </>
    );
  }

  return (
    <>
      Запустить оценку
      <ArrowRight className="h-4 w-4" />
    </>
  );
}
