import type { ApplicationStatus } from '@/src/shared/api/applications';
import {
  ProjectAutocomplete,
  type ProjectAutocompleteOption,
} from '@/src/shared/ui/project-autocomplete';
import { ProjectSelect, type ProjectSelectOption } from '@/src/shared/ui/project-select';
import type { ApplicationFormState } from '../_lib/application-form';
import { statusOptions } from '../_lib/application-presentation';
import {
  ApplicationField,
  applicationAutocompleteClassName,
  applicationInputClassName,
} from './application-field';
import { ApplicationScheduleFields } from './application-schedule-fields';

type Props = {
  form: ApplicationFormState;
  onChange: <K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K]
  ) => void;
  resumeOptions: ProjectSelectOption[];
  vacancyOptions?: ProjectAutocompleteOption[];
  vacancyLoading?: boolean;
  vacancyAutocomplete?: boolean;
};

export function ApplicationFields({
  form,
  onChange,
  resumeOptions,
  vacancyOptions = [],
  vacancyLoading = false,
  vacancyAutocomplete = false,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ApplicationField label="Вакансия">
        {vacancyAutocomplete ? (
          <ProjectAutocomplete
            required
            value={form.vacancyTitle}
            onValueChange={(value) => onChange('vacancyTitle', value)}
            options={vacancyOptions}
            ariaLabel="Вакансия"
            placeholder="Продуктовый аналитик"
            isLoading={vacancyLoading}
            emptyMessage="Похожих должностей не найдено"
            className={applicationAutocompleteClassName}
          />
        ) : (
          <input
            required
            value={form.vacancyTitle}
            onChange={(event) => onChange('vacancyTitle', event.target.value)}
            placeholder="Продуктовый аналитик"
            className={applicationInputClassName}
          />
        )}
      </ApplicationField>
      <ApplicationField label="Компания">
        <input
          value={form.company || ''}
          onChange={(event) => onChange('company', event.target.value)}
          placeholder="Название компании"
          className={applicationInputClassName}
        />
      </ApplicationField>
      <ApplicationField label="Статус">
        <ProjectSelect
          value={form.status}
          onValueChange={(value) => onChange('status', value as ApplicationStatus)}
          options={statusOptions}
          ariaLabel="Статус отклика"
          className="mt-2"
        />
      </ApplicationField>
      <ApplicationField label="Резюме">
        <ProjectSelect
          value={form.resumeId || '__none__'}
          onValueChange={(value) => onChange('resumeId', value === '__none__' ? null : value)}
          options={resumeOptions}
          ariaLabel="Резюме"
          className="mt-2"
        />
      </ApplicationField>
      <ApplicationScheduleFields form={form} onChange={onChange} />
      <ApplicationField label="Версия резюме">
        <input
          required
          value={form.resumeVariant}
          onChange={(event) => onChange('resumeVariant', event.target.value)}
          placeholder="Адаптация под вакансию"
          className={applicationInputClassName}
        />
      </ApplicationField>
      <ApplicationField label="Ссылка на вакансию">
        <input
          type="url"
          value={form.vacancyUrl || ''}
          onChange={(event) => onChange('vacancyUrl', event.target.value)}
          placeholder="https://example.ru/vacancy/..."
          className={applicationInputClassName}
        />
      </ApplicationField>
      <div className="md:col-span-2">
        <ApplicationField label="Заметка">
          <textarea
            value={form.notes || ''}
            onChange={(event) => onChange('notes', event.target.value)}
            placeholder="Контакт рекрутера, формат интервью, ссылка на встречу, договорённости"
            className={`${applicationInputClassName} min-h-24 py-3`}
          />
        </ApplicationField>
      </div>
    </div>
  );
}
