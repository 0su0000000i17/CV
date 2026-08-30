import { ChevronDown } from 'lucide-react';

import type { SectionRow } from './analysis-section-rows';
import { getScoreBarClass, getScoreTextClass } from './score-styles';
import styles from './analysis-detail-list.module.css';

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
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-4 sm:p-5">
      <h2 className="px-1 text-xl font-medium tracking-[-0.025em] text-foreground">
        Детализация
      </h2>

      <div className="mt-4 space-y-2">
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
    </section>
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
  const scoreScale = hasAnalysis ? item.score / 100 : 0;
  const detailsId = `analysis-detail-${item.key}`;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-[background-color,border-color] ${
        isOpened
          ? 'border-white/15 bg-white/[0.035]'
          : 'border-transparent hover:border-white/10 hover:bg-white/[0.022]'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleMetric(item.key)}
        aria-expanded={isOpened}
        aria-controls={detailsId}
        className="w-full px-3 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-foreground">{item.title}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-white/35 transition-transform duration-300 ${
                isOpened ? 'rotate-180' : ''
              }`}
            />
          </span>
          <span
            className={
              hasAnalysis ? getScoreTextClass(item.score) : 'text-white/30'
            }
          >
            {hasAnalysis ? `${item.score}/100` : '—'}
          </span>
        </div>

        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={`h-full origin-left rounded-full transition-transform duration-700 ease-out ${
              hasAnalysis ? getScoreBarClass() : 'bg-white/20'
            }`}
            style={{ transform: `scaleX(${scoreScale})` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{item.status}</p>
      </button>

      <div
        id={detailsId}
        aria-hidden={!isOpened}
        className={`${styles.detailReveal} ${
          isOpened ? styles.detailRevealOpen : ''
        }`}
      >
        <div>
          <p className="mx-3 mb-3 border-t border-white/10 pt-3 text-xs leading-5 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
