import type { CoverLetterTone } from '@/src/shared/api/cover-letters';

import { adaptationCoverLetterToneOptions } from './cover-letter-tones';

type Props = {
  selectedTone: CoverLetterTone;
  onSelectTone: (tone: CoverLetterTone) => void;
};

export function CoverLetterToneSelector({
  selectedTone,
  onSelectTone,
}: Props) {
  return (
    <div className="space-y-2.5">
      {adaptationCoverLetterToneOptions.map((option) => {
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
  );
}