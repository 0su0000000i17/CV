import { BarChart3 } from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';

type Props = {
  analysis: ResumeAnalysisResult;
};

export function AnalysisSummaryCard({ analysis }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20">
          <BarChart3 className="h-5 w-5" />
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
  );
}
