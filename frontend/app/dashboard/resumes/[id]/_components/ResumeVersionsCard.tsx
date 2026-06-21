import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

export function ResumeVersionsCard({ resume }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Сохранённые версии
      </h2>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">
          У резюме «{resume.title}» пока нет сохранённых версий.
        </p>
      </div>
    </div>
  );
}
