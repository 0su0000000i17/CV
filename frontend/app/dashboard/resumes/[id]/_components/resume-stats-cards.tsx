import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

function getScoreTextClass(score: number | null | undefined) {
  if (typeof score !== 'number') {
    return 'text-foreground';
  }

  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-amber-400';
  }

  return 'text-red-400';
}

function getScoreLabel(score: number | null | undefined) {
  if (typeof score !== 'number') {
    return '—';
  }

  return `${score}/100`;
}

export function ResumeStatsCards({ resume }: Props) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">Оценка</p>

        <p
          className={`mt-3 text-3xl font-semibold ${getScoreTextClass(
            resume.last_score
          )}`}
        >
          {getScoreLabel(resume.last_score)}
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