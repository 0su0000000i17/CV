import { ChevronDown } from 'lucide-react';

import type { SectionRow } from './analysis-section-rows';
import { getScoreBarClass, getScoreTextClass } from './score-styles';

type Props = {
  sectionRows: SectionRow[];
  hasAnalysis: boolean;
  openedMetricKey: string | null;
  onToggleMetric: (metricKey: string) => void;
};

export function AnalysisDetailList({
  sectionRows,
  hasAnalysis,
  openedMetricKey,
  onToggleMetric,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">Детализация</h2>

      <div className="mt-5 space-y-2">
        {sectionRows.map((item) => (
          <AnalysisDetailRow
            key={item.key}
            item={item}
            hasAnalysis={hasAnalysis}
            isOpened={openedMetricKey === item.key}
            onToggleMetric={onToggleMetric}
          />
        ))}
      </div>
    </div>
  );
}

function AnalysisDetailRow({
  item,
  hasAnalysis,
  isOpened,
  onToggleMetric,
}: {
  item: SectionRow;
  hasAnalysis: boolean;
  isOpened: boolean;
  onToggleMetric: (metricKey: string) => void;
}) {
  const scoreWidth = hasAnalysis ? item.score : 0;

  return (
    <button
      type="button"
      onClick={() => onToggleMetric(item.key)}
      aria-expanded={isOpened}
      className="w-full cursor-pointer rounded-xl border border-transparent px-3 py-2 text-left transition-colors duration-150 hover:border-border hover:bg-muted/40"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-foreground">{item.title}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
              isOpened ? 'rotate-180' : ''
            }`}
          />
        </div>

        <span className={hasAnalysis ? getScoreTextClass(item.score) : 'text-muted-foreground'}>
          {hasAnalysis ? `${item.score}/100` : '—'}
        </span>
      </div>

      <div className="h-1 rounded-full bg-muted">
        <div
          className={`h-1 rounded-full transition-all duration-500 ${
            hasAnalysis ? getScoreBarClass(item.score) : 'bg-muted-foreground/20'
          }`}
          style={{ width: `${scoreWidth}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{item.status}</p>

      {isOpened && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-1 rounded-lg border border-border bg-background/70 px-3 py-2 duration-150">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
      )}
    </button>
  );
}
