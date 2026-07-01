import { CheckCircle2, FileSearch, ShieldAlert, Target } from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';

import { AnalysisEmptyState } from './result/analysis-empty-state';
import { AnalysisErrorState } from './result/analysis-error-state';
import { AnalysisLoadingState } from './result/analysis-loading-state';
import { AnalysisSummaryCard } from './result/analysis-summary-card';
import { MissingKeywordsSection } from './result/missing-keywords-section';
import { RedFlagsBlock } from './result/red-flags-block';
import { ResultSection } from './result/result-section';

type Props = {
  analysis?: ResumeAnalysisResult;
  isAnalyzing: boolean;
  isError: boolean;
  errorMessage?: string;
};

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
    return <AnalysisErrorState errorMessage={errorMessage} />;
  }

  if (!analysis) {
    return <AnalysisEmptyState />;
  }

  return (
    <div className="space-y-5">
      <AnalysisSummaryCard analysis={analysis} />
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

      <MissingKeywordsSection keywords={analysis.missingKeywords} />
    </div>
  );
}
