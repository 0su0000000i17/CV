import { useState } from 'react';

import { textToList } from '@/src/features/resume-editor/model/text';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { SmallInput, TextArea } from '@/src/features/resume-editor/ui/form-controls';

type EditableWorkField =
  | 'company'
  | 'companyUrl'
  | 'position'
  | 'dates'
  | 'focus';

type WorkItemEditDraft = {
  company?: string | null;
  companyUrl?: string | null;
  position?: string | null;
  dates?: string | null;
  focus?: string | null;
  adaptedBullets: string[];
};

type Props = {
  item: WorkItemEditDraft;
  index: number;
  updateDraft: DraftUpdater;
  onDone: () => void;
};

function createFormState(item: WorkItemEditDraft) {
  return {
    company: item.company || '',
    companyUrl: item.companyUrl || '',
    position: item.position || '',
    dates: item.dates || '',
    focus: item.focus || '',
    bulletsText: item.adaptedBullets.join('\n'),
  };
}

function toNullable(value: string) {
  return value ? value : null;
}

export function WorkEditForm({ item, index, updateDraft, onDone }: Props) {
  const [formState, setFormState] = useState(() => createFormState(item));

  function updateField(field: EditableWorkField, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));

    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];

      if (!entry) return;

      entry[field] = toNullable(value);
    });
  }

  function updateBullets(value: string) {
    setFormState((current) => ({ ...current, bulletsText: value }));

    updateDraft((current) => {
      const entry = current.adaptedResume.experience[index];

      if (!entry) return;

      entry.adaptedBullets = textToList(value);
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SmallInput
          label="Компания"
          value={formState.company}
          placeholder="Название компании"
          onChange={(value) => updateField('company', value)}
        />

        <SmallInput
          label="Должность"
          value={formState.position}
          placeholder="Название роли"
          onChange={(value) => updateField('position', value)}
        />

        <SmallInput
          label="Даты"
          value={formState.dates}
          placeholder="Период работы"
          onChange={(value) => updateField('dates', value)}
        />

        <SmallInput
          label="Сайт компании"
          value={formState.companyUrl}
          placeholder="site.ru"
          onChange={(value) => updateField('companyUrl', value)}
        />
      </div>

      <TextArea
        label="Краткое описание роли / проекта"
        value={formState.focus}
        rows={2}
        placeholder="Коротко опишите роль или проект."
        onChange={(value) => updateField('focus', value)}
      />

      <TextArea
        label="Обязанности и достижения"
        value={formState.bulletsText}
        rows={6}
        placeholder="Каждый пункт опыта — с новой строки"
        onChange={updateBullets}
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
