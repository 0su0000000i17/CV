import type { FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';

import type { ProjectAutocompleteOption } from '@/src/shared/ui/project-autocomplete';
import type { ProjectSelectOption } from '@/src/shared/ui/project-select';
import { isApplicationFormValid, type ApplicationFormState } from '../_lib/application-form';
import styles from '../applications.module.css';
import { ApplicationFields } from './application-fields';
import { MutationError } from './application-ui';

type Props = {
  rendered: boolean;
  open: boolean;
  form: ApplicationFormState;
  resumeOptions: ProjectSelectOption[];
  vacancyOptions: ProjectAutocompleteOption[];
  vacancyLoading: boolean;
  pending: boolean;
  error: unknown;
  onChange: <K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K]
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateApplicationForm(props: Props) {
  if (!props.rendered) return null;

  return (
    <section
      className={`${props.open ? styles.formEnter : styles.formExit} rounded-xl border border-foreground/10 bg-foreground/[0.018] p-5 sm:p-6`}
    >
      <div>
        <h2 className="text-xl font-medium tracking-[-0.025em] text-foreground">Новая запись</h2>
        <p className="mt-1 text-sm text-foreground/45">
          Добавьте отклик, запланированную вакансию или сразу назначенное интервью.
        </p>
      </div>
      <form onSubmit={props.onSubmit} className="mt-5">
        <ApplicationFields
          form={props.form}
          onChange={props.onChange}
          resumeOptions={props.resumeOptions}
          vacancyOptions={props.vacancyOptions}
          vacancyLoading={props.vacancyLoading}
          vacancyAutocomplete
        />
        {props.error ? (
          <MutationError error={props.error} fallback="Не удалось сохранить запись" />
        ) : null}
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!isApplicationFormValid(props.form) || props.pending}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2563a9] px-5 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[#2b6fba] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckCircle2 className="h-4 w-4" />
            {props.pending ? 'Сохраняем...' : 'Сохранить запись'}
          </button>
        </div>
      </form>
    </section>
  );
}
