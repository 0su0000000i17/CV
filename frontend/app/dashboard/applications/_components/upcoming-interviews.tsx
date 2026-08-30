import { Pencil } from 'lucide-react';

import type { JobApplication } from '@/src/shared/api/applications';
import { InterviewDateBadge } from './application-ui';

export function UpcomingInterviews({
  applications,
  onEdit,
}: {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
}) {
  if (!applications.length) return null;

  return (
    <section className="rounded-xl border border-brand-400/20 bg-brand-500/[0.055] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.15em] text-brand-300">
            Планировщик
          </p>
          <h2 className="mt-2 text-lg font-medium text-foreground">Ближайшие интервью</h2>
        </div>
        <span className="text-xs text-foreground/40">
          {applications.length} интервью
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {applications.slice(0, 4).map((application) => (
          <button
            key={application.id}
            type="button"
            onClick={() => onEdit(application)}
            className="group flex cursor-pointer items-center gap-4 rounded-lg border border-foreground/10 bg-card/70 p-4 text-left transition-[border-color,background-color,transform] hover:border-brand-400/30 hover:bg-card active:scale-[0.995]"
          >
            <InterviewDateBadge value={application.interview_at as string} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {application.vacancy_title}
              </span>
              <span className="mt-1 block truncate text-xs text-foreground/45">
                {application.company || 'Компания не указана'}
              </span>
            </span>
            <Pencil className="h-4 w-4 shrink-0 text-foreground/35 transition-colors group-hover:text-brand-300" />
          </button>
        ))}
      </div>
    </section>
  );
}
