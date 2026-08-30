import Link from 'next/link';
import { Wand2 } from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';
import type { UploadedResume } from '@/src/shared/api/resumes';

import { getScoreTextClass } from './score-styles';
import styles from './analysis-score-card.module.css';
import {
  AnalysisButtonContent,
  getImproveNudge,
  getScoreDescription,
  ScoreComparison,
} from './analysis-score-content';

type Props = {
  selectedResume?: UploadedResume;
  displayAnalysis?: ResumeAnalysisResult;
  previousScore?: number;
  isAnalyzing: boolean;
  onAnalyze: () => void;
};

export function AnalysisScoreCard({
  selectedResume,
  displayAnalysis,
  previousScore,
  isAnalyzing,
  onAnalyze,
}: Props) {
  const scoreLabel = displayAnalysis ? displayAnalysis.score : '—';
  const improveNudge = getImproveNudge(displayAnalysis);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <p className="text-sm text-muted-foreground">Итоговая оценка</p>

      <div className="mt-5 flex items-end gap-2">
        <span
          key={displayAnalysis?.score ?? (isAnalyzing ? 'loading' : 'empty')}
          className={`${displayAnalysis ? styles.scoreEnter : ''} text-6xl font-medium tracking-[-0.06em] ${
            displayAnalysis
              ? getScoreTextClass(displayAnalysis.score)
              : isAnalyzing
                ? 'animate-pulse text-white/20'
                : 'text-white/25'
          }`}
        >
          {scoreLabel}
        </span>

        <span className="pb-3 text-muted-foreground">/100</span>
      </div>

      {displayAnalysis && typeof previousScore === 'number' ? (
        <ScoreComparison current={displayAnalysis.score} previous={previousScore} />
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {getScoreDescription(displayAnalysis, isAnalyzing)}
      </p>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!selectedResume || isAnalyzing}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white transition-[background-color,transform,opacity] hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <AnalysisButtonContent analysis={displayAnalysis} isAnalyzing={isAnalyzing} />
      </button>

      {!isAnalyzing && selectedResume && improveNudge && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {improveNudge}
          </p>
          <Link
            href={`/dashboard/improve?resumeId=${selectedResume.id}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            <Wand2 className="h-4 w-4" />
            Улучшить резюме
          </Link>
        </div>
      )}
    </section>
  );
}
