import { TriangleAlert } from 'lucide-react';

import type { ResumeVacancyFitRiskFlag } from '@/src/shared/api/resume-vacancy-fit';

import { riskFlagLabels, severityClasses, severityLabels } from './labels';

type Props = {
  riskFlags: ResumeVacancyFitRiskFlag[];
};

export function RiskFlags({ riskFlags }: Props) {
  if (!riskFlags.length) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground/65 ring-1 ring-border">
          <TriangleAlert className="h-4 w-4" />
        </div>

        <h3 className="font-medium text-foreground">Риск-факторы</h3>
      </div>

      <div className="space-y-3">
        {riskFlags.map((flag) => (
          <div
            key={flag.type + flag.explanation}
            className="rounded-xl border border-border bg-background/60 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {riskFlagLabels[flag.type]}
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
    </div>
  );
}
