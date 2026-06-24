import { Loader2, Sparkles, Wand2 } from 'lucide-react';

import type { CoverLetterTone } from '@/src/shared/api/cover-letters';

import { coverLetterToneOptions } from './tone-options';

type Props = {
  selectedTone: CoverLetterTone;
  isGenerating: boolean;
  canGenerate: boolean;
  onSelectTone: (tone: CoverLetterTone) => void;
  onGenerate: () => void;
};

export function CoverLetterToneCard({
  selectedTone,
  isGenerating,
  canGenerate,
  onSelectTone,
  onGenerate,
}: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-muted p-2.5">
          <Sparkles className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Тон письма</h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Выберите стиль, в котором будет написано сопроводительное.
          </p>
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
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {isGenerating
          ? 'Генерируем письмо...'
          : 'Сгенерировать сопроводительное'}
      </button>
    </section>
  );
}