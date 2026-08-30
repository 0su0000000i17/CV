import { BriefcaseBusiness, Search, type LucideIcon } from 'lucide-react';

export function MutationError({
  error,
  fallback,
}: {
  error: unknown;
  fallback: string;
}) {
  return (
    <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
      {error instanceof Error ? error.message : fallback}
    </p>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-foreground/10 bg-foreground/[0.018] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-foreground/45">{label}</p>
        <Icon className="h-4 w-4 text-foreground/35" />
      </div>
      <p className="mt-3 text-2xl font-medium tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function InterviewDateBadge({ value }: { value: string }) {
  const date = new Date(value);
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const month = date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');

  return (
    <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-brand-400/25 bg-brand-500/10 text-center">
      <span className="text-lg font-medium leading-none text-brand-300">{date.getDate()}</span>
      <span className="mt-1 text-[0.62rem] uppercase tracking-[0.08em] text-foreground/45">
        {month}
      </span>
      <span className="mt-1 border-t border-brand-400/15 pt-1 text-[0.68rem] font-medium leading-none tabular-nums text-foreground/65">
        {time}
      </span>
    </span>
  );
}

export function ApplicationsEmptyState({ hasApplications }: { hasApplications: boolean }) {
  const Icon = hasApplications ? Search : BriefcaseBusiness;
  return (
    <div className="p-8 text-center sm:p-12">
      <Icon className="mx-auto h-8 w-8 text-foreground/20" />
      <h3 className="mt-4 font-medium text-foreground/80">
        {hasApplications ? 'В этом разделе записей нет' : 'Откликов пока нет'}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground/45">
        {hasApplications
          ? 'Выберите другой фильтр или обновите статус нужной записи.'
          : 'Добавьте вакансию, отклик или запланированное интервью — всё будет доступно на одном экране.'}
      </p>
    </div>
  );
}
