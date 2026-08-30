import { Banknote, CalendarClock, CalendarDays, ExternalLink } from 'lucide-react';

import type { JobApplication } from '@/src/shared/api/applications';
import {
  formatInterviewDate,
  formatRubles,
  statusClasses,
  statusOptions,
} from '../_lib/application-presentation';

export function ApplicationRowDetails({
  application,
  resumeName,
}: {
  application: JobApplication;
  resumeName?: string | null;
}) {
  const statusLabel = statusOptions.find(
    (option) => option.value === application.status
  )?.label;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-foreground">{application.vacancy_title}</h3>
        <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] ${statusClasses[application.status]}`}>
          {statusLabel}
        </span>
        {application.interview_at ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-500/10 px-2.5 py-1 text-[0.68rem] text-brand-300">
            <CalendarClock className="h-3 w-3" />
            {formatInterviewDate(application.interview_at)}
          </span>
        ) : null}
        {application.offer_salary_rub ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/30 bg-brand-400/12 px-2.5 py-1 text-[0.68rem] text-brand-300">
            <Banknote className="h-3 w-3" />
            {formatRubles(application.offer_salary_rub)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-foreground/45">
        {[application.company, resumeName].filter(Boolean).join(' · ') ||
          'Без компании и привязки к резюме'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/35">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {new Date(application.applied_at || application.created_at).toLocaleDateString('ru-RU')}
        </span>
        <span>Версия: {application.resume_variant}</span>
        {application.vacancy_url ? (
          <a
            href={application.vacancy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-400 transition-colors hover:text-brand-300"
          >
            Вакансия <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      {application.notes ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/45">
          {application.notes}
        </p>
      ) : null}
    </div>
  );
}
