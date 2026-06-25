import { SmallInput, TextArea } from './form-controls';
import type { DraftUpdater } from './types';
import { textToList } from './utils';

type Props = {
  item: {
    company?: string | null;
    position?: string | null;
    dates?: string | null;
    focus?: string | null;
    adaptedBullets: string[];
  };
  index: number;
  updateDraft: DraftUpdater;
  onDone: () => void;
};

export function WorkEditForm({ item, index, updateDraft, onDone }: Props) {
  function updateField(
    field: 'company' | 'position' | 'dates' | 'focus',
    value: string
  ) {
    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];

      if (!entry) return;

      entry[field] = value.trim() ? value : null;
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SmallInput
          label="Даты"
          value={item.dates || ''}
          onChange={(value) => updateField('dates', value)}
        />

        <SmallInput
          label="Компания"
          value={item.company || ''}
          onChange={(value) => updateField('company', value)}
        />

        <SmallInput
          label="Должность"
          value={item.position || ''}
          onChange={(value) => updateField('position', value)}
        />
      </div>

      <TextArea
        value={item.focus || ''}
        rows={3}
        placeholder="Акцент блока"
        onChange={(value) => updateField('focus', value)}
      />

      <TextArea
        value={item.adaptedBullets.join('\n')}
        rows={8}
        placeholder="Каждый пункт опыта — с новой строки"
        onChange={(value) =>
          updateDraft((current) => {
            const entry = current.adaptedResume.experience[index];

            if (!entry) return;

            entry.adaptedBullets = textToList(value);
          })
        }
      />

      <button
        type="button"
        onClick={onDone}
        className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Готово
      </button>
    </div>
  );
}
