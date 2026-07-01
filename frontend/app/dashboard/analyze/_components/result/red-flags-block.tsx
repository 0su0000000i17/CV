import { TriangleAlert } from 'lucide-react';

import type { ResumeRedFlag } from '@/src/shared/api/analyze';

import {
  redFlagLabels,
  severityClasses,
  severityLabels,
} from './red-flag-labels';

type Props = {
  redFlags: ResumeRedFlag[];
};

export function RedFlagsBlock({ redFlags }: Props) {
  if (!redFlags.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20">
          <TriangleAlert className="h-4 w-4" />
        </div>

        <h3 className="text-lg font-medium text-foreground">
          Почему такая оценка
        </h3>
      </div>

      <div className="divide-y divide-border">
        {redFlags.map((flag) => (
          <div
            key={`${flag.type}-${flag.explanation}`}
            className="py-4 first:pt-0 last:pb-0"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {redFlagLabels[flag.type] || flag.type}
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
    </section>
  );
}
