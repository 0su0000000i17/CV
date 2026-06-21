import type { UploadedResume } from '@/src/shared/api/resumes';

type ResumesStatsProps = {
  resumes: UploadedResume[];
};

export function ResumesStats({ resumes }: ResumesStatsProps) {
  const analyzedCount = resumes.filter(
    (resume) => resume.analysis_status === 'completed'
  ).length;

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Всего резюме</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">
          {resumes.length}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Проанализировано</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">
          {analyzedCount}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Адаптаций</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">0</p>
      </div>
    </div>
  );
}
