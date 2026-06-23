import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

export function ResumeActivityCard({ resume }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">История действий</h2>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">
          История по резюме «{resume.title}» появится после анализа, адаптаций и
          скачиваний.
        </p>
      </div>
    </div>
  );
}
