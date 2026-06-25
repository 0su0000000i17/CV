import { normalizeCompanyUrl, textToList } from '@/src/features/resume-editor/model/text';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { SmallInput, TextArea } from '@/src/features/resume-editor/ui/form-controls';

type EditableWorkField =
  | 'company'
  | 'companyUrl'
  | 'position'
  | 'dates'
  | 'focus';

type Props = {
  item: {
    company?: string | null;
    companyUrl?: string | null;
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
  function updateField(field: EditableWorkField, value: string) {
    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];

      if (!entry) return;

      entry[field] =
        field === 'companyUrl'
          ? normalizeCompanyUrl(value)
          : value.trim()
            ? value
            : null;
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SmallInput
          label="Компания"
          value={item.company || ''}
          placeholder="Название компании"
          onChange={(value) => updateField('company', value)}
        />

        <SmallInput
          label="Должность"
          value={item.position || ''}
          placeholder="Название роли"
          onChange={(value) => updateField('position', value)}
        />

        <SmallInput
          label="Даты"
          value={item.dates || ''}
          placeholder="Период работы"
          onChange={(value) => updateField('dates', value)}
        />

        <SmallInput
          label="Сайт компании"
          value={item.companyUrl || ''}
          placeholder="site.ru"
          onChange={(value) => updateField('companyUrl', value)}
        />
      </div>

      <TextArea
        label="Краткое описание роли / проекта"
        value={item.focus || ''}
        rows={2}
        placeholder="Коротко опишите роль или проект."
        onChange={(value) => updateField('focus', value)}
      />

      <TextArea
        label="Обязанности и достижения"
        value={item.adaptedBullets.join('\n')}
        rows={6}
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
