import { SelectInput, SmallInput } from '@/src/features/resume-editor/ui/form-controls';

import { workMonths, type parseWorkDates } from './work-edit-values';

type Dates = ReturnType<typeof parseWorkDates>;
type Props = { dates: Dates; onChange: (field: keyof Dates, value: string | boolean) => void };

export function WorkDateFields({ dates, onChange }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Начало работы</p>
        <div className="grid grid-cols-2 gap-3">
          <SelectInput label="Месяц" value={dates.startMonth} options={workMonths} onChange={(value) => onChange('startMonth', value)} />
          <SmallInput label="Год" value={dates.startYear} onChange={(value) => onChange('startYear', value)} />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Окончание</p>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={dates.isCurrent}
              onChange={(event) => onChange('isCurrent', event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Работаю сейчас
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectInput label="Месяц" value={dates.endMonth} options={workMonths} onChange={(value) => onChange('endMonth', value)} />
          <SmallInput label="Год" value={dates.endYear} onChange={(value) => onChange('endYear', value)} />
        </div>
      </div>
    </div>
  );
}
