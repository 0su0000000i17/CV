import type { ClipboardCopyStatus } from '@/src/shared/hooks/use-clipboard-copy';
import { CoverLetterCopyControl, CoverLetterCopyError } from './cover-letter-copy-control';

type Props = {
  value: string;
  warnings: string[];
  copyStatus: ClipboardCopyStatus;
  onCopy: () => void;
  onChange: (value: string) => void;
  compact?: boolean;
};

export function CoverLetterResultCard({
  value,
  warnings,
  copyStatus,
  onCopy,
  onChange,
  compact = false,
}: Props) {
  if (!value) {
    return null;
  }

  return (
    <section
      className={
        compact
          ? 'mt-5 space-y-4'
          : 'rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6'
      }
    >
      <div
        className={
          compact
            ? 'mb-4 space-y-3'
            : 'mb-4 flex items-start justify-between gap-4'
        }
      >
        <div>
          <h2
            className={
              compact
                ? 'font-medium text-foreground'
                : 'text-xl font-medium text-foreground'
            }
          >
            Готовое сопроводительное
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Можно отредактировать перед отправкой
          </p>
        </div>

        <CoverLetterCopyControl compact={compact} copyStatus={copyStatus} onCopy={onCopy} />
      </div>
      {copyStatus === 'error' ? <CoverLetterCopyError /> : null}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? 'min-h-[260px]' : 'min-h-[280px]'} w-full resize-y rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-[background-color,border-color] focus:border-white/25 focus:bg-white/[0.035]`}
      />

      {warnings.length ? (
        <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
          <p className="text-sm font-medium text-orange-500">Предупреждения</p>

          <ul className="mt-2 space-y-1 text-sm text-orange-500/90">
            {warnings.map((warning) => (
              <li key={warning}>— {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
