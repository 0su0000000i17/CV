import { TextArea } from './form-controls';
import type { DraftUpdater } from './types';
import { textToList } from './utils';

type Props = {
  item: {
    focus?: string | null;
    adaptedBullets: string[];
  };
  index: number;
  updateDraft: DraftUpdater;
  onDone: () => void;
};

export function WorkEditForm({ item, index, updateDraft, onDone }: Props) {
  return (
    <div className="mt-4 space-y-4">
      <TextArea
        value={item.focus || ''}
        rows={3}
        placeholder="Акцент блока"
        onChange={(value) =>
          updateDraft((current) => {
            const entry = current.adaptedResume.experience[index];

            if (!entry) {
              return;
            }

            entry.focus = value.trim() ? value : null;
          })
        }
      />

      <TextArea
        value={item.adaptedBullets.join('\n')}
        rows={8}
        placeholder="Каждый пункт опыта — с новой строки"
        onChange={(value) =>
          updateDraft((current) => {
            const entry = current.adaptedResume.experience[index];

            if (!entry) {
              return;
            }

            entry.adaptedBullets = textToList(value);
          })
        }
      />

      <button
        type="button"
        onClick={onDone}
        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Готово
      </button>
    </div>
  );
}
