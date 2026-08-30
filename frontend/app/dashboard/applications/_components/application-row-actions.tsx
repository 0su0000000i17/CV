import { Pencil, Trash2 } from 'lucide-react';

import type { ApplicationStatus, JobApplication } from '@/src/shared/api/applications';
import { ProjectSelect } from '@/src/shared/ui/project-select';
import { statusOptions } from '../_lib/application-presentation';

export function ApplicationRowActions({
  application,
  disabled,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  application: JobApplication;
  disabled: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const iconButtonClass =
    'grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-foreground/12 bg-foreground/[0.04] text-foreground/60 transition-[border-color,background-color,color,transform] active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
      <div className="min-w-[10.5rem] flex-1 sm:flex-none">
        <ProjectSelect
          value={application.status}
          disabled={disabled}
          onValueChange={(value) => onStatusChange(value as ApplicationStatus)}
          options={statusOptions}
          ariaLabel={`Статус отклика ${application.vacancy_title}`}
          size="compact"
        />
      </div>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        aria-label={`Редактировать ${application.vacancy_title}`}
        title="Редактировать"
        className={`${iconButtonClass} hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-400`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Удалить ${application.vacancy_title}`}
        title="Удалить"
        className={`${iconButtonClass} hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-500`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
