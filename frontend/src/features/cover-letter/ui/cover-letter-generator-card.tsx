import { Loader2, Sparkles, Wand2 } from 'lucide-react';

import type { CoverLetterTone } from '@/src/shared/api/cover-letters';

import { coverLetterToneOptions } from './tone-options';

type Props = {
  selectedTone: CoverLetterTone;
  isGenerating: boolean;
  canGenerate: boolean;
  onSelectTone: (tone: CoverLetterTone) => void;
  onGenerate: () => void;
  title?: string;
  description?: string;
  buttonLabel?: string;
  pendingLabel?: string;
  compact?: boolean;
};

export function CoverLetterGeneratorCard({
  selectedTone,
  isGenerating,
  canGenerate,
  onSelectTone,
  onGenerate,
  title = 'Тон письма',
  description = 'Выберите стиль письма',
  buttonLabel = 'Сгенерировать сопроводительное',
  pendingLabel = 'Генерируем письмо...',
  compact = false,
}: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
          <Sparkles
            className="block h-[18px] w-[18px]"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className={compact ? 'font-medium text-foreground' : 'text-xl font-medium text-foreground'}>
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2.5">
        {coverLetterToneOptions.map((option) => {
          const active = selectedTone === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectTone(option.value)}
              className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background/60 text-foreground hover:bg-muted'
              }`}
            >
              <span className="block text-sm font-medium">{option.title}</span>

              <span
                className={`mt-1 block text-xs leading-relaxed ${
                  active ? 'text-background/70' : 'text-muted-foreground'
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {isGenerating ? pendingLabel : buttonLabel}
      </button>
    </section>
  );
}
