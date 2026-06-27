import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function formatFileSize(size: number | null) {
  if (!size) return 'JSON';
  return `${Math.round(size / 1024)} KB`;
}

export function ResumeFileInfoCard({ resume }: Props) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">Данные файла</h2>

      <div className="mt-5 space-y-4 text-sm">
        <InfoRow label="Название" value={resume.file_name} />
        <InfoRow label="Размер" value={formatFileSize(resume.file_size)} />
        <InfoRow label="Загружено" value={formatDate(resume.created_at)} />
        <InfoRow label="Обновлено" value={formatDate(resume.updated_at)} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
