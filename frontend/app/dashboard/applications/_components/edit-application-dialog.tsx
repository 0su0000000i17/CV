import type { FormEvent } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectSelectOption } from '@/src/shared/ui/project-select';
import { isApplicationFormValid, type ApplicationFormState } from '../_lib/application-form';
import { ApplicationFields } from './application-fields';
import { MutationError } from './application-ui';

type Props = {
  open: boolean;
  form: ApplicationFormState;
  resumeOptions: ProjectSelectOption[];
  pending: boolean;
  error: unknown;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K]
  ) => void;
};

export function EditApplicationDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto rounded-xl">
        <DialogTitle>Редактировать запись</DialogTitle>
        <DialogDescription>
          Обновите этап, детали вакансии или время предстоящего интервью.
        </DialogDescription>
        <form onSubmit={props.onSubmit} className="mt-5">
          <ApplicationFields
            form={props.form}
            onChange={props.onChange}
            resumeOptions={props.resumeOptions}
          />
          {props.error ? (
            <MutationError error={props.error} fallback="Не удалось обновить запись" />
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={props.onDelete}
              disabled={props.pending}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-foreground/12 bg-foreground/[0.03] px-4 text-sm text-foreground/60 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-45"
            >
              <Trash2 className="h-4 w-4" />
              Удалить запись
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <DialogClose asChild>
                <button
                  type="button"
                  disabled={props.pending}
                  className="h-10 cursor-pointer rounded-lg border border-foreground/12 px-4 text-sm text-foreground/65 hover:bg-foreground/[0.05] disabled:opacity-45"
                >
                  Отмена
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={props.pending || !isApplicationFormValid(props.form)}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2563a9] px-4 text-sm font-medium text-white hover:bg-[#2b6fba] disabled:opacity-45"
              >
                <CheckCircle2 className="h-4 w-4" />
                {props.pending ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
