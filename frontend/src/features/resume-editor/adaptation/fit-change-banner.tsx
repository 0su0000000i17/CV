import { TrendingUp } from 'lucide-react';

import type { AdaptationFitSnapshot } from '@/src/shared/api/resume-adaptation';

export function FitChangeBanner({
  fitBefore,
  fitAfter,
}: {
  fitBefore?: AdaptationFitSnapshot | null;
  fitAfter?: AdaptationFitSnapshot | null;
}) {
  if (!fitAfter) return null;
  const delta = fitBefore ? fitAfter.score - fitBefore.score : null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-500/25 bg-brand-500/5 p-4">
      <div className="rounded-lg bg-brand-500/10 p-2 text-brand-300 ring-1 ring-brand-500/20">
        <TrendingUp className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Совпадение с вакансией:{' '}
          {fitBefore ? (
            <>
              <span className="text-muted-foreground">{fitBefore.score}</span>
              {' → '}
              <span className="text-brand-300">{fitAfter.score}</span> из 100
              {delta !== null && delta > 0 ? (
                <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-300">
                  +{delta}
                </span>
              ) : null}
            </>
          ) : <span className="text-brand-300">{fitAfter.score} из 100</span>}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {fitAfter.gaps.length
            ? `Остались пробелы, которые нельзя закрыть честно: ${fitAfter.gaps.slice(0, 3).join('; ')}${fitAfter.gaps.length > 3 ? '…' : ''}`
            : 'Адаптированное резюме закрывает требования вакансии без выдумывания опыта.'}
        </p>
      </div>
    </div>
  );
}
