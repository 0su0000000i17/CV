import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { SmallInput, TextArea } from '@/src/features/resume-editor/ui/form-controls';

import { useWorkEditForm } from './use-work-edit-form';
import { WorkDateFields } from './work-date-fields';
import type { WorkItemEditDraft } from './work-edit-values';

type Props = { item: WorkItemEditDraft; index: number; updateDraft: DraftUpdater; onDone: () => void };

export function WorkEditForm({ item, index, updateDraft, onDone }: Props) {
  const form = useWorkEditForm(item, index, updateDraft);
  const state = form.formState;
  return (
    <div className="mt-5 space-y-5 rounded-2xl border border-border bg-background/30 p-4 md:p-5">
      <div className="grid gap-3">
        <SmallInput label="Компания" value={state.company} placeholder="Название компании" onChange={(value) => form.updateField('company', value)} />
        <SmallInput label="Должность или профессия" value={state.position} placeholder="Название роли" onChange={(value) => form.updateField('position', value)} />
        <SmallInput label="Город или регион" value={state.companyCity} placeholder="Москва" onChange={(value) => form.updateField('companyCity', value)} />
        <SmallInput label="Сайт компании" value={state.companyUrl} placeholder="https://company.ru" onChange={(value) => form.updateField('companyUrl', value)} />
        <TextArea
          label="Сфера деятельности компании — по одной на строку"
          value={state.companyIndustries}
          rows={2}
          onChange={form.updateIndustries}
        />
      </div>
      <WorkDateFields dates={state.dates} onChange={form.updateDateField} />
      <TextArea
        label="Обязанности и достижения"
        value={state.description}
        rows={12}
        placeholder={'Проект: ...\nСтек: ...\n\nДостижения:\n- ...'}
        onChange={form.updateDescription}
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
