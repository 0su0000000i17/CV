import { BarChart3 } from 'lucide-react';

import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';

type Props = {
  analysis: ResumeAnalysisResult;
};

export function AnalysisSummaryCard({ analysis }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/55">
          <BarChart3 className="h-5 w-5" strokeWidth={1.6} />
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
