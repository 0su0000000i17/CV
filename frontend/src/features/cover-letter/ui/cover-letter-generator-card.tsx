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
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60">
          <Sparkles
            className="block h-[18px] w-[18px]"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <div>
          <h2
            className={
              compact
                ? 'font-medium text-foreground'
                : 'text-xl font-medium text-foreground'
            }
          >
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
                  ? 'border-white/25 bg-white/[0.075] text-white'
                  : 'border-white/10 bg-white/[0.015] text-foreground hover:border-white/20 hover:bg-white/[0.035]'
              }`}
            >
              <span className="block text-sm font-medium">{option.title}</span>

              <span
                className={`mt-1 block text-xs leading-relaxed ${
                  active ? 'text-white/45' : 'text-muted-foreground'
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
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-medium text-white transition-[background-color,box-shadow] hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-950/20 disabled:cursor-not-allowed disabled:opacity-50"
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
