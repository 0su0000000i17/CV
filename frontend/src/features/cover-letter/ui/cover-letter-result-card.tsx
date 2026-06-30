import { Clipboard } from 'lucide-react';

type Props = {
  value: string;
  warnings: string[];
  copyStatus: 'idle' | 'copied' | 'error';
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
    <section className={compact ? 'mt-5 space-y-4' : 'rounded-2xl border border-border bg-card/60 p-5'}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className={compact ? 'font-medium text-foreground' : 'text-xl font-medium text-foreground'}>
            Готовое сопроводительное
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Можно отредактировать перед отправкой
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <Clipboard className="h-4 w-4" />
          {copyStatus === 'copied'
            ? 'Скопировано'
            : copyStatus === 'error'
              ? 'Ошибка'
              : 'Скопировать'}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? 'min-h-[260px]' : 'min-h-[280px]'} w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-foreground/40`}
      />

      {warnings.length ? (
        <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
          <p className="text-sm font-medium text-orange-500">
            Предупреждения
          </p>

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
