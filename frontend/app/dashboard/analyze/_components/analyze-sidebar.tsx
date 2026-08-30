'use client';

import { useState } from 'react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';
import type { UploadedResume } from '@/src/shared/api/resumes';

import { AnalysisDetailList } from './sidebar/analysis-detail-list';
import { AnalysisScoreCard } from './sidebar/analysis-score-card';
import { getSectionRows } from './sidebar/analysis-section-rows';

type Props = {
  selectedResume?: UploadedResume;
  analysis?: ResumeAnalysisResult;
  previousScore?: number;
  isAnalyzing: boolean;
  onAnalyze: () => void;
};

export function AnalyzeSidebar({
  selectedResume,
  analysis,
  previousScore,
  isAnalyzing,
  onAnalyze,
}: Props) {
  const [openedMetricKey, setOpenedMetricKey] = useState<string | null>(null);
  const displayAnalysis = isAnalyzing ? undefined : analysis;
  const hasAnalysis = Boolean(displayAnalysis);
  const sectionRows = getSectionRows(displayAnalysis, isAnalyzing);

  function toggleMetric(metricKey: string) {
    setOpenedMetricKey((currentKey) =>
      currentKey === metricKey ? null : metricKey
    );
  }

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <AnalysisScoreCard
        selectedResume={selectedResume}
        displayAnalysis={displayAnalysis}
        previousScore={previousScore}
        isAnalyzing={isAnalyzing}
        onAnalyze={onAnalyze}
      />

      <AnalysisDetailList
        sectionRows={sectionRows}
        hasAnalysis={hasAnalysis}
        openedMetricKey={openedMetricKey}
        onToggleMetric={toggleMetric}
      />
    </aside>
  );
}
