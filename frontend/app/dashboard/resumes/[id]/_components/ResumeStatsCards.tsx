import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

export function ResumeStatsCards({ resume }: Props) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Оценка</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">
          {resume.last_score ? `${resume.last_score}/100` : '—'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Версий</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">0</p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Адаптаций</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">0</p>
      </div>
    </div>
  );
}
