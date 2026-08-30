import { ArrowRight, RotateCw, Sparkles } from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';

export function getImproveNudge(analysis?: ResumeAnalysisResult) {
  if (!analysis) return null;
  if (analysis.score < 60) {
    return 'Оценка низкая — прежде чем откликаться, рекомендуем улучшить резюме в соответствующем разделе.';
  }
  if (analysis.score < 80) {
    return 'Резюме можно усилить и поднять оценку выше — попробуйте раздел «Улучшить резюме».';
  }
  return null;
}

export function getScoreDescription(analysis: ResumeAnalysisResult | undefined, isAnalyzing: boolean) {
  if (isAnalyzing) return 'Итоговая оценка появится после завершения анализа.';
  if (analysis) {
    return 'Оценка рассчитана по роли, опыту, доказательности, профилю резюме, ATS и риск-факторам.';
  }
  return 'Оценка появится после запуска анализа.';
}

export function AnalysisButtonContent({
  analysis,
  isAnalyzing,
}: {
  analysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
}) {
  if (isAnalyzing) {
    return <><Sparkles className="h-4 w-4 animate-pulse" />Оценка идёт...</>;
  }
  if (analysis) {
    return <>Повторить оценку<RotateCw className="h-4 w-4" /></>;
  }
  return <>Запустить оценку<ArrowRight className="h-4 w-4" /></>;
}

export function ScoreComparison({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  const deltaClass = delta > 0
    ? 'bg-white/[0.06] text-white/70'
    : delta < 0
      ? 'bg-white/[0.04] text-white/50'
      : 'bg-white/[0.04] text-muted-foreground';
  const deltaLabel = delta > 0
    ? `+${delta} после изменений`
    : delta < 0
      ? `${delta} после изменений`
      : 'без изменения балла';

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-sm">
      <span className="text-muted-foreground">{previous}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium text-foreground">{current}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${deltaClass}`}>{deltaLabel}</span>
    </div>
  );
}
